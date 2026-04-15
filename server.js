const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-20b";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/extract-medication", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY in .env." });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    const prompt = [
      "Read this prescription bottle label image.",
      "Extract: medicationName, dosage, instructions, confidence.",
      "Return JSON only with exactly those keys.",
      "confidence must be 0 to 1.",
      "If unreadable, set confidence low and use best guess strings.",
    ].join(" ");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      return res.status(502).json({
        error: "Groq request failed.",
        details,
      });
    }

    const data = await groqResponse.json();

    const content = data?.choices?.[0]?.message?.content;
    const extracted = safeParseJson(content);

    if (!extracted) {
      return res.status(502).json({
        error: "Could not parse AI extraction result.",
      });
    }

    return res.json({
      medicationName: String(extracted.medicationName || "").trim() || "Unknown medication",
      dosage: String(extracted.dosage || "").trim() || "Unknown dosage",
      instructions:
        String(extracted.instructions || "").trim() || "Follow your prescription label.",
      confidence: normalizeConfidence(extracted.confidence),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Extraction failed.",
      details: error?.message || "Unknown server error.",
    });
  }
});

app.post("/api/medication-summary", async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY in .env." });
    }

    const medicationNameRaw = req.body?.medicationName;
    const medicationName = String(medicationNameRaw || "").trim();
    if (!medicationName) {
      return res.status(400).json({ error: "Missing medicationName." });
    }

    const prompt = [
      "You are helping a user understand a medication at a high level.",
      "Return JSON only.",
      "No medical advice, no dosing, no diagnosis, no treatment recommendations.",
      "If uncertain, say so. Be conservative and general.",
      "",
      `Medication: ${medicationName}`,
      "",
      "Return exactly this JSON shape:",
      "{",
      '  \"medicationName\": string,',
      '  \"isOverTheCounter\": boolean | null,',
      '  \"prescribedFor\": string[],',
      '  \"whatItDoes\": string,',
      '  \"simpleSummary\": string,',
      '  \"commonSideEffects\": string[],',
      '  \"warnings\": string[]',
      "}",
      "",
      "Rules:",
      "- If the bottle indication is unknown, list the most common reasons it is prescribed/used.",
      "- If OTC status varies by country or formulation, set isOverTheCounter to null and mention that in simpleSummary.",
      "- Keep simpleSummary 2-4 sentences, plain language.",
    ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      return res.status(502).json({ error: "Groq request failed.", details });
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    const summary = safeParseJson(content);
    if (!summary) {
      return res.status(502).json({ error: "Could not parse AI summary result." });
    }

    return res.json({
      medicationName: String(summary.medicationName || medicationName).trim() || medicationName,
      isOverTheCounter:
        typeof summary.isOverTheCounter === "boolean" ? summary.isOverTheCounter : null,
      prescribedFor: Array.isArray(summary.prescribedFor)
        ? summary.prescribedFor.map((x) => String(x).trim()).filter(Boolean).slice(0, 6)
        : [],
      whatItDoes: String(summary.whatItDoes || "").trim(),
      simpleSummary: String(summary.simpleSummary || "").trim(),
      commonSideEffects: Array.isArray(summary.commonSideEffects)
        ? summary.commonSideEffects.map((x) => String(x).trim()).filter(Boolean).slice(0, 8)
        : [],
      warnings: Array.isArray(summary.warnings)
        ? summary.warnings.map((x) => String(x).trim()).filter(Boolean).slice(0, 8)
        : [],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Summary failed.",
      details: error?.message || "Unknown server error.",
    });
  }
});

function safeParseJson(input) {
  if (!input || typeof input !== "string") return null;
  try {
    return JSON.parse(input);
  } catch (_error) {
    const match = input.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_error2) {
      return null;
    }
  }
}

function normalizeConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}

app.listen(PORT, () => {
  console.log(`MediLens backend running at http://localhost:${PORT}`);
});
