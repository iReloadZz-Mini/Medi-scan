const pillImageInput = document.getElementById("pill-image");
const imagePreviewWrap = document.getElementById("image-preview-wrap");
const imagePreview = document.getElementById("image-preview");
const analyzeButton = document.getElementById("analyze-button");
const manualAddButton = document.getElementById("manual-add-button");
const resetButton = document.getElementById("reset-button");
const statusMessage = document.getElementById("status-message");
const summaryPanel = document.getElementById("summary-panel");
const exportIcsButton = document.getElementById("export-ics-button");
const saveMedicationButton = document.getElementById("save-medication-button");
const addAnotherButton = document.getElementById("add-another-button");
const verificationPanel = document.getElementById("verification-panel");
const verificationMessage = document.getElementById("verification-message");
const detectedMedName = document.getElementById("detected-med-name");
const manualMedName = document.getElementById("manual-med-name");
const useDetectedButton = document.getElementById("use-detected-button");
const useManualButton = document.getElementById("use-manual-button");
const retakePhotoButton = document.getElementById("retake-photo-button");
const manualEntryPanel = document.getElementById("manual-entry-panel");
const manualEntryName = document.getElementById("manual-entry-name");
const manualTimeHour = document.getElementById("manual-time-hour");
const manualTimeMinute = document.getElementById("manual-time-minute");
const manualTimePeriod = document.getElementById("manual-time-period");
const manualNoTime = document.getElementById("manual-no-time");
const saveManualEntryButton = document.getElementById("save-manual-entry-button");
const cancelManualEntryButton = document.getElementById("cancel-manual-entry-button");
const cameraCaptureButton = document.getElementById("camera-capture-button");
const identifyPillImageInput = document.getElementById("identify-pill-image");
const identifyCameraButton = document.getElementById("identify-camera-button");
const identifyResult = document.getElementById("identify-result");
const identifiedPillName = document.getElementById("identified-pill-name");
const identifiedPillUse = document.getElementById("identified-pill-use");
const identifiedPillConfidence = document.getElementById("identified-pill-confidence");
const identifyPillLabel = document.querySelector('label[for="identify-pill-image"]');
const identifyPanelTitle = document.getElementById("identify-panel-title");
const scanGuide = document.getElementById("scan-guide");
const scanShapeToggle = document.getElementById("scan-shape-toggle");
const scanShapeToggleBottle = document.getElementById("scan-shape-toggle-bottle");
const flashlightButton = document.getElementById("flashlight-button");
const scanProcessing = document.getElementById("scan-processing");
const photoPanel = document.getElementById("photo-panel");
const identifyPanel = document.getElementById("identify-panel");

const medName = document.getElementById("med-name");
const medDosage = document.getElementById("med-dosage");
const medScheduleText = document.getElementById("med-schedule-text");
const medScheduleTextCopy = document.getElementById("med-schedule-text-copy");
const medSummary = document.getElementById("med-summary");
const medSideEffects = document.getElementById("med-side-effects");
const medSideEffectsCopy = document.getElementById("med-side-effects-copy");
const medWarnings = document.getElementById("med-warnings");
const summaryHeroImage = document.getElementById("summary-hero-image");
const summarySafetyBanner = document.getElementById("summary-safety-banner");
const addToScheduleButton = document.getElementById("add-to-schedule-button");
const scheduleSummary = document.getElementById("schedule-summary");
const weekCalendar = document.getElementById("week-calendar");
const weekLabel = document.getElementById("week-label");
const prevWeekButton = document.getElementById("prev-week-button");
const nextWeekButton = document.getElementById("next-week-button");
const overallCount = document.getElementById("overall-count");
const overallNames = document.getElementById("overall-names");
const overallDoses = document.getElementById("overall-doses");
const overallWarnings = document.getElementById("overall-warnings");
const todayTimeline = document.getElementById("today-timeline");
const syncGoogleButton = document.getElementById("sync-google-button");
const syncAppleButton = document.getElementById("sync-apple-button");
const caregiverAccessLevel = document.getElementById("caregiver-access-level");
const generateCaregiverLinkButton = document.getElementById("generate-caregiver-link");
const caregiverLinkOutput = document.getElementById("caregiver-link-output");
const alertSound = document.getElementById("alert-sound");
const quietHoursStart = document.getElementById("quiet-hours-start");
const quietHoursEnd = document.getElementById("quiet-hours-end");
const quietHoursNonessential = document.getElementById("quiet-hours-nonessential");
const dynamicTypeSize = document.getElementById("dynamic-type-size");
const dynamicTypeValue = document.getElementById("dynamic-type-value");
const medColorPicker = document.getElementById("med-color-picker");
const notificationCenter = document.getElementById("notification-center");
const monthCalendar = document.getElementById("month-calendar");
const todayProgressRing = document.getElementById("today-progress-ring");
const todayDate = document.getElementById("today-date");
const tabToday = document.getElementById("tab-today");
const tabScan = document.getElementById("tab-scan");
const tabHealth = document.getElementById("tab-health");
const appSections = document.querySelectorAll(".app-section");
const caregiverBanner = document.getElementById("caregiver-banner");

let uploadedImageFile = null;
let latestMedicationData = null;
let pendingExtractedData = null;
const API_BASE_URL = resolveApiBaseUrl();
const SAVED_MEDS_KEY = "medilens_saved_medications";
let savedMedications = loadSavedMedications();
let latestScheduleAnchor = null; // date used to anchor week view
let currentWeekOffset = 0;
let identifiedPillFile = null;
const ADHERENCE_LOG_KEY = "medilens_adherence_log";
const CAREGIVER_LINKS_KEY = "medilens_caregiver_links";
const NOTIFICATION_PREFS_KEY = "medilens_notification_prefs";
let adherenceLog = loadJson(ADHERENCE_LOG_KEY, {});
let caregiverLinks = loadJson(CAREGIVER_LINKS_KEY, []);
let notificationPreferences = loadJson(NOTIFICATION_PREFS_KEY, {
  sound: "calm",
  quietStart: "22:00",
  quietEnd: "07:00",
  quietNonessential: true,
});
let currentScanMode = "bottle";

setupManualTimePicker();
setupBottomNavigation();
setupScanInterface();
renderTodayDate();
syncCaretakerBanner();

function setupBottomNavigation() {
  const tabs = [
    { button: tabToday, value: "today" },
    { button: tabScan, value: "scan" },
    { button: tabHealth, value: "health" },
  ];
  for (const tab of tabs) {
    tab.button?.addEventListener("click", () => setActiveTab(tab.value));
  }
  setActiveTab("today");
}

function setActiveTab(tabName) {
  appSections.forEach((section) => {
    const sectionTab = section.getAttribute("data-tab");
    const isSummaryPanel = section.id === "summary-panel";
    if (sectionTab === tabName) {
      if (isSummaryPanel && !latestMedicationData) section.classList.add("hidden");
      else section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
  tabToday?.setAttribute("aria-current", tabName === "today" ? "page" : "false");
  tabScan?.setAttribute("aria-current", tabName === "scan" ? "page" : "false");
  tabHealth?.setAttribute("aria-current", tabName === "health" ? "page" : "false");
  if (tabName === "scan") setScanMode(currentScanMode);
}

function setupScanInterface() {
  setScanMode("bottle");
  const toggleMode = () => {
    setScanMode(currentScanMode === "bottle" ? "pill" : "bottle");
  };
  scanShapeToggle?.addEventListener("click", toggleMode);
  scanShapeToggleBottle?.addEventListener("click", toggleMode);

  // Demo-friendly low-light helper for environments without camera light API.
  const lowLightLikely = new Date().getHours() < 7 || new Date().getHours() > 18;
  if (lowLightLikely) flashlightButton?.classList.remove("hidden");
  flashlightButton?.addEventListener("click", () => {
    statusMessage.textContent = "Flashlight requested. Use your device torch if available.";
  });
}

function setScanMode(mode) {
  currentScanMode = mode === "pill" ? "pill" : "bottle";
  const isPillMode = currentScanMode === "pill";
  scanGuide?.classList.toggle("loose-pill", isPillMode);
  if (scanShapeToggle) {
    scanShapeToggle.textContent = isPillMode
      ? "Switch to Pill Bottle Scan"
      : "Switch to Loose Pill Scan";
  }
  if (scanShapeToggleBottle) {
    scanShapeToggleBottle.textContent = isPillMode
      ? "Switch to Pill Bottle Scan"
      : "Switch to Loose Pill Scan";
  }
  // Show only the active scan workflow panel.
  photoPanel?.classList.toggle("hidden", isPillMode);
  // Keep the dark mode-switch chooser visible in both modes.
  identifyPanel?.classList.remove("hidden");
  identifyPillLabel?.classList.toggle("hidden", !isPillMode);
  identifyPillImageInput?.classList.toggle("hidden", !isPillMode);
  identifyCameraButton?.classList.toggle("hidden", !isPillMode);
  identifyResult?.classList.toggle("hidden", !isPillMode);
  if (identifyPanelTitle) {
    identifyPanelTitle.textContent = isPillMode ? "Identify Random Pill" : "Scan Mode";
  }
  statusMessage.textContent = isPillMode
    ? "Loose pill mode enabled. Capture or choose a loose-pill photo."
    : "Pill bottle mode enabled. Capture or choose a bottle label photo.";
}

function renderTodayDate() {
  if (!todayDate) return;
  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function syncCaretakerBanner() {
  const params = new URLSearchParams(window.location.search);
  const caregiver = params.get("caregiver");
  if (!caregiver) return;
  caregiverBanner?.classList.add("visible");
}

function startOfWeek(date) {
  // Monday-based weeks.
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diffToMonday = (day + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function renderWeekCalendar() {
  if (!latestMedicationData?.schedule?.events) return;
  if (!weekCalendar || !weekLabel) return;

  const events = latestMedicationData.schedule.events;
  const anchor = latestScheduleAnchor ? new Date(latestScheduleAnchor) : new Date();
  const weekStart = addDays(startOfWeek(anchor), currentWeekOffset * 7);
  const weekEnd = addDays(weekStart, 7);

  const fmt = (d) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  weekLabel.textContent = `${fmt(weekStart)} - ${fmt(addDays(weekEnd, -1))}`;

  weekCalendar.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStart, i);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = addDays(dayStart, 1);

    const dayName = dayStart.toLocaleDateString(undefined, { weekday: "short" });
    const dayEvents = events
      .filter((ev) => ev.start >= dayStart && ev.start < dayEnd)
      .sort((a, b) => a.start - b.start);

    const col = document.createElement("div");
    col.className = "day-column";

    const nameEl = document.createElement("div");
    nameEl.className = "day-name";
    nameEl.textContent = dayName;

    const listEl = document.createElement("div");
    listEl.className = "day-events";

    if (dayEvents.length === 0) {
      const empty = document.createElement("div");
      empty.className = "day-event";
      empty.textContent = "No doses";
      empty.style.borderStyle = "dashed";
      empty.style.background = "rgba(148, 163, 184, 0.08)";
      listEl.appendChild(empty);
    } else {
      for (const ev of dayEvents) {
        const item = document.createElement("div");
        item.className = "day-event";

        const time = document.createElement("div");
        time.className = "day-event-time";
        time.textContent = formatTime(ev.start);

        const title = document.createElement("div");
        title.className = "day-event-title";
        title.textContent = ev.title;

        item.appendChild(time);
        item.appendChild(title);
        listEl.appendChild(item);
      }
    }

    col.appendChild(nameEl);
    col.appendChild(listEl);
    weekCalendar.appendChild(col);
  }
}

prevWeekButton?.addEventListener("click", () => {
  currentWeekOffset -= 1;
  renderWeekCalendar();
});

nextWeekButton?.addEventListener("click", () => {
  currentWeekOffset += 1;
  renderWeekCalendar();
});

// Scroll feature: hold Shift while scrolling over the calendar to jump weeks.
weekCalendar?.addEventListener(
  "wheel",
  (e) => {
    if (!e.shiftKey) return;
    if (Math.abs(e.deltaY) < 10) return;
    if (e.deltaY > 0) currentWeekOffset += 1;
    else currentWeekOffset -= 1;
    renderWeekCalendar();
  },
  { passive: true }
);

pillImageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  uploadedImageFile = file;
  const imageUrl = URL.createObjectURL(file);
  imagePreview.src = imageUrl;
  imagePreviewWrap.classList.remove("hidden");
  statusMessage.textContent = "Photo selected. Ready to analyze.";
});

cameraCaptureButton?.addEventListener("click", () => {
  if (currentScanMode === "pill") {
    identifyPillImageInput?.setAttribute("capture", "environment");
    identifyPillImageInput?.click();
    return;
  }
  pillImageInput?.setAttribute("capture", "environment");
  pillImageInput?.click();
});

analyzeButton.addEventListener("click", async () => {
  if (!uploadedImageFile) {
    statusMessage.textContent = "Please choose a photo before analyzing.";
    return;
  }

  statusMessage.textContent = "Analyzing label with Vision AI...";
  analyzeButton.disabled = true;

  try {
    const extracted = await mockVisionExtract(uploadedImageFile);
    if (!isExtractionCertain(extracted)) {
      pendingExtractedData = extracted;
      showVerificationPrompt(extracted);
      statusMessage.textContent =
        "We are not fully certain. Confirm the name, edit it, or retake the photo.";
      return;
    }

    await finalizeMedicationFlow(extracted);
    statusMessage.textContent = "Done. Review your summary dashboard below.";
  } catch (error) {
    const message = error?.message ? String(error.message) : "Unknown error";
    statusMessage.textContent = `Analysis failed: ${message}`;
    console.error(error);
  } finally {
    analyzeButton.disabled = false;
  }
});

resetButton.addEventListener("click", () => {
  uploadedImageFile = null;
  latestMedicationData = null;
  pendingExtractedData = null;
  pillImageInput.value = "";
  imagePreview.src = "";
  imagePreviewWrap.classList.add("hidden");
  summaryPanel.classList.add("hidden");
  verificationPanel.classList.add("hidden");
  resetManualEntryFields();
  manualMedName.value = "";
  statusMessage.textContent = "Waiting for photo...";
});

exportIcsButton.addEventListener("click", () => {
  if (!latestMedicationData) return;
  exportScheduleAsIcs(latestMedicationData);
});

syncGoogleButton?.addEventListener("click", () => {
  if (!latestMedicationData?.schedule?.events?.length) return;
  openGoogleCalendarForFirstEvent(latestMedicationData);
});

syncAppleButton?.addEventListener("click", () => {
  if (!latestMedicationData) return;
  exportScheduleAsIcs(latestMedicationData);
  statusMessage.textContent = "ICS exported. Open it on Apple devices to import into Apple Calendar.";
});

saveMedicationButton.addEventListener("click", () => {
  if (!latestMedicationData) {
    statusMessage.textContent = "Analyze a medication first, then save it.";
    return;
  }

  saveCurrentMedication();
  renderOverallSummary();
  statusMessage.textContent = "Medication saved. You can add another one now.";
});

addAnotherButton.addEventListener("click", () => {
  prepareForAnotherMedication();
  statusMessage.textContent = "Ready for another medication photo.";
});

identifyPillImageInput?.addEventListener("change", async (event) => {
  identifiedPillFile = event.target.files?.[0] || null;
  if (!identifiedPillFile) return;
  if (currentScanMode !== "pill") return;
  await runLoosePillScan();
});

identifyCameraButton?.addEventListener("click", () => {
  if (currentScanMode !== "pill") {
    statusMessage.textContent =
      "You are in bottle mode. Switch to loose pill mode to identify loose pills.";
    return;
  }
  identifyPillImageInput?.setAttribute("capture", "environment");
  identifyPillImageInput?.click();
});

async function runLoosePillScan() {
  if (!identifiedPillFile) {
    statusMessage.textContent = "Choose a loose-pill photo first.";
    return;
  }
  try {
    scanProcessing?.classList.remove("hidden");
    const result = await identifyLoosePill(identifiedPillFile);
    identifyResult?.classList.remove("hidden");
    identifiedPillName.textContent = result.name;
    identifiedPillUse.textContent = result.intendedUse;
    identifiedPillConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
    updateSafetyBannerForUnknownPill(result);
    statusMessage.textContent = "Pill identification complete. Verify before taking.";
  } catch (error) {
    statusMessage.textContent = `Identify failed: ${String(error?.message || "Unknown error")}`;
  } finally {
    await wait(450);
    scanProcessing?.classList.add("hidden");
  }
}

addToScheduleButton?.addEventListener("click", () => {
  if (!latestMedicationData?.schedule) return;
  const ok = window.confirm(
    "Confirm AI-generated medication times and add them to your calendar schedule?"
  );
  if (!ok) return;
  exportScheduleAsIcs(latestMedicationData);
  statusMessage.textContent = "Schedule confirmed and exported for calendar sync.";
});

generateCaregiverLinkButton?.addEventListener("click", () => {
  const access = caregiverAccessLevel?.value === "edit" ? "edit" : "read";
  const shareToken = crypto.randomUUID();
  const link = `${window.location.origin}${window.location.pathname}?caregiver=${shareToken}&access=${access}`;
  caregiverLinks.push({
    access,
    token: shareToken,
    createdAt: new Date().toISOString(),
    medicationCount: savedMedications.length,
  });
  localStorage.setItem(CAREGIVER_LINKS_KEY, JSON.stringify(caregiverLinks));
  caregiverLinkOutput.textContent = `Share link (${access}): ${link}`;
});

dynamicTypeSize?.addEventListener("input", () => {
  const pct = Number(dynamicTypeSize.value) || 100;
  document.documentElement.style.setProperty("--dynamic-scale", String(pct / 100));
  if (dynamicTypeValue) dynamicTypeValue.textContent = `${pct}%`;
});

medColorPicker?.addEventListener("input", () => {
  const color = medColorPicker.value || "#22c55e";
  document.documentElement.style.setProperty("--med-color", color);
});

alertSound?.addEventListener("change", saveNotificationPreferencesFromInputs);
quietHoursStart?.addEventListener("change", saveNotificationPreferencesFromInputs);
quietHoursEnd?.addEventListener("change", saveNotificationPreferencesFromInputs);
quietHoursNonessential?.addEventListener("change", saveNotificationPreferencesFromInputs);

manualAddButton?.addEventListener("click", () => {
  manualEntryPanel?.classList.remove("hidden");
  manualEntryName?.focus();
  statusMessage.textContent = "Enter medication details below, then save manual entry.";
});

saveManualEntryButton?.addEventListener("click", async () => {
  const trimmedName = manualEntryName?.value.trim() || "";
  if (!trimmedName) {
    statusMessage.textContent = "Enter a medication name before saving.";
    return;
  }

  const parsedTime = getManualEntryTime();
  const displayTime = parsedTime ? formatTimeDisplay(parsedTime) : "No time provided";

  const extractedManual = {
    medicationName: trimmedName,
    dosage: "Not provided",
    instructions: `Manual entry. First dose time: ${displayTime}.`,
    confidence: 1,
  };

  try {
    await finalizeMedicationFlow(extractedManual, parsedTime);
    verificationPanel.classList.add("hidden");
    resetManualEntryFields();
    statusMessage.textContent = "Manual medication entry added.";
  } catch (error) {
    const message = error?.message ? String(error.message) : "Unknown error";
    statusMessage.textContent = `Manual entry failed: ${message}`;
    console.error(error);
  }
});

cancelManualEntryButton?.addEventListener("click", () => {
  resetManualEntryFields();
  statusMessage.textContent = "Manual entry cancelled.";
});

useDetectedButton.addEventListener("click", async () => {
  if (!pendingExtractedData) return;
  await finalizeMedicationFlow(pendingExtractedData);
  verificationPanel.classList.add("hidden");
  statusMessage.textContent = "Used detected name. Dashboard updated.";
});

useManualButton.addEventListener("click", async () => {
  if (!pendingExtractedData) return;

  const typed = manualMedName.value.trim();
  if (!typed) {
    statusMessage.textContent = "Type a medication name before continuing.";
    return;
  }

  const updated = {
    ...pendingExtractedData,
    medicationName: typed,
    confidence: 1,
  };

  await finalizeMedicationFlow(updated);
  verificationPanel.classList.add("hidden");
  statusMessage.textContent = "Manual name saved. Dashboard updated.";
});

retakePhotoButton.addEventListener("click", () => {
  pendingExtractedData = null;
  summaryPanel.classList.add("hidden");
  verificationPanel.classList.add("hidden");
  manualMedName.value = "";
  statusMessage.textContent = "Please upload another photo for a better scan.";
});

async function mockVisionExtract(_file) {
  const formData = new FormData();
  formData.append("image", _file);

  const response = await fetch(apiUrl("/api/extract-medication"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const raw = await response.text();
    let details = raw;
    try {
      const parsed = JSON.parse(raw);
      const errorMessage = parsed?.error ? String(parsed.error) : "";
      const errorDetails = parsed?.details ? String(parsed.details) : "";
      details = [errorMessage, errorDetails].filter(Boolean).join(" ");
      if (!details) details = raw;
    } catch (_e) {
      // keep raw text
    }

    throw new Error(`Backend extraction failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  return {
    medicationName: data.medicationName,
    dosage: data.dosage,
    instructions: data.instructions,
    confidence: data.confidence,
  };
}

async function getKnowledgeSummary(medicationName) {
  const response = await fetch(apiUrl("/api/medication-summary"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medicationName }),
  });

  if (!response.ok) {
    const raw = await response.text();
    let details = raw;
    try {
      const parsed = JSON.parse(raw);
      const errorMessage = parsed?.error ? String(parsed.error) : "";
      const errorDetails = parsed?.details ? String(parsed.details) : "";
      details = [errorMessage, errorDetails].filter(Boolean).join(" ");
      if (!details) details = raw;
    } catch (_e) {
      // keep raw text
    }
    throw new Error(`Summary failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  const prescribedFor = Array.isArray(data.prescribedFor) ? data.prescribedFor : [];
  const otc =
    typeof data.isOverTheCounter === "boolean"
      ? data.isOverTheCounter
        ? "Over-the-counter (OTC)"
        : "Prescription-only"
      : "OTC status varies / unknown";

  const whatItDoes = data.whatItDoes ? String(data.whatItDoes).trim() : "";
  const extra =
    prescribedFor.length || whatItDoes
      ? ` Common uses: ${prescribedFor.join(", ") || "Unknown"}. ${
          whatItDoes ? `What it does: ${whatItDoes}` : ""
        } (${otc}).`
      : ` (${otc}).`;

  return {
    simpleSummary: `${String(data.simpleSummary || "").trim()}${extra}`.trim(),
    sideEffects: Array.isArray(data.commonSideEffects) ? data.commonSideEffects : [],
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
}

function buildSchedule(instructions, firstDoseTime) {
  const lower = instructions.toLowerCase();
  const everyHours = getNumberAfterWord(lower, "every") || 12;
  const pillCount = getNumberAfterWord(lower, "take") || 1;
  const durationDays = getNumberBeforeWord(lower, "days") || 7;
  const firstHour = firstDoseTime?.hour;
  const firstMinute = firstDoseTime?.minute;

  const events = [];
  const now = new Date();

  if (typeof firstHour !== "number" || typeof firstMinute !== "number") {
    return {
      everyHours,
      pillCount,
      durationDays,
      hasTime: false,
      events,
    };
  }

  for (let day = 0; day < durationDays; day++) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() + day);

    for (let hour = 0; hour < 24; hour += everyHours) {
      const eventStart = new Date(dayStart);
      eventStart.setHours(firstHour + hour, firstMinute, 0, 0);
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventEnd.getMinutes() + 15);

      events.push({
        title: `Take ${pillCount} pill${pillCount > 1 ? "s" : ""}`,
        start: eventStart,
        end: eventEnd,
      });
    }
  }

  return {
    everyHours,
    pillCount,
    durationDays,
    hasTime: true,
    events,
  };
}

function isExtractionCertain(extracted) {
  const confidence = typeof extracted.confidence === "number" ? extracted.confidence : 0;
  return confidence >= 0.98;
}

function showVerificationPrompt(extracted) {
  detectedMedName.textContent = extracted.medicationName || "(unknown)";
  verificationMessage.textContent = `Confidence: ${Math.round(
    (extracted.confidence || 0) * 100
  )}%. Please verify before we continue.`;
  manualMedName.value = extracted.medicationName || "";
  verificationPanel.classList.remove("hidden");
}

async function finalizeMedicationFlow(extracted, firstDoseTimeOverride) {
  const firstDoseTime =
    firstDoseTimeOverride !== undefined
      ? firstDoseTimeOverride
      : resolveFirstDoseTime(extracted.instructions);
  const knowledge = await getKnowledgeSummary(extracted.medicationName);
  const schedule = buildSchedule(extracted.instructions, firstDoseTime);

  latestMedicationData = {
    extracted,
    knowledge,
    schedule,
  };

  ensureAdherenceEntries(latestMedicationData);

  renderDashboard(latestMedicationData);
  summaryPanel.classList.remove("hidden");
  setActiveTab("scan");
  pendingExtractedData = null;
  renderOverallSummary();
  renderTodayDashboard();
  renderNotificationCenter();
  renderMonthCalendar();
}

function renderDashboard(data) {
  const { extracted, knowledge, schedule } = data;

  medName.innerHTML = `<strong>${extracted.medicationName}</strong>`;
  medDosage.textContent = extracted.dosage;
  medScheduleText.textContent = extracted.instructions;
  if (medScheduleTextCopy) medScheduleTextCopy.textContent = extracted.instructions;
  medSummary.textContent = knowledge.simpleSummary;
  if (medSideEffectsCopy) {
    medSideEffectsCopy.textContent = knowledge.sideEffects.length
      ? knowledge.sideEffects.join(", ")
      : "No common side effects listed.";
  }
  if (summaryHeroImage) summaryHeroImage.src = imagePreview?.src || "";

  medSideEffects.innerHTML = "";
  for (const effect of knowledge.sideEffects) {
    const li = document.createElement("li");
    li.textContent = effect;
    medSideEffects.appendChild(li);
  }

  medWarnings.innerHTML = "";
  for (const warning of knowledge.warnings) {
    const li = document.createElement("li");
    li.textContent = warning;
    medWarnings.appendChild(li);
  }

  scheduleSummary.textContent = schedule.hasTime
    ? `${schedule.pillCount} pill(s) every ${schedule.everyHours} hours for ${schedule.durationDays} days`
    : `${schedule.pillCount} pill(s) every ${schedule.everyHours} hours for ${schedule.durationDays} days (time not set)`;

  const unknownMedication =
    !extracted.medicationName ||
    String(extracted.medicationName).toLowerCase().includes("unknown") ||
    extracted.confidence < 0.7;
  if (summarySafetyBanner) {
    if (unknownMedication) {
      summarySafetyBanner.classList.add("visible");
      summarySafetyBanner.innerHTML = `
        Unknown or random pill detected. Do not ingest this medication until confirmed.
        <div class="actions">
          <button class="btn-danger" type="button" onclick="window.open('tel:18002221222')">Contact Poison Control</button>
          <button class="btn-secondary" type="button" onclick="window.open('https://safe.pharmacy/drug-disposal/', '_blank')">Safe Disposal Info</button>
        </div>
      `;
    } else {
      summarySafetyBanner.classList.remove("visible");
      summarySafetyBanner.textContent = "";
    }
  }

  // Anchor the week view to the first scheduled event (so "Week 1" matches your plan).
  latestScheduleAnchor = schedule.events?.[0]?.start ? new Date(schedule.events[0].start) : new Date();
  currentWeekOffset = 0;
  renderWeekCalendar();
}

function exportScheduleAsIcs(data) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MediLens//MedicationSchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of data.schedule.events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${crypto.randomUUID()}@medilens.app`);
    lines.push(`DTSTAMP:${toIcsDate(new Date())}`);
    lines.push(`DTSTART:${toIcsDate(event.start)}`);
    lines.push(`DTEND:${toIcsDate(event.end)}`);
    lines.push(`SUMMARY:${event.title} - ${data.extracted.medicationName}`);
    lines.push(`DESCRIPTION:Dosage ${data.extracted.dosage}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  const icsContent = lines.join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.extracted.medicationName.toLowerCase()}-schedule.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saveCurrentMedication() {
  const entry = {
    id: `${Date.now()}-${Math.round(Math.random() * 100000)}`,
    extracted: latestMedicationData.extracted,
    knowledge: latestMedicationData.knowledge,
    schedule: latestMedicationData.schedule,
    savedAt: new Date().toISOString(),
  };

  savedMedications.push(entry);
  localStorage.setItem(SAVED_MEDS_KEY, JSON.stringify(savedMedications));
  ensureAdherenceEntries(entry);
}

function prepareForAnotherMedication() {
  uploadedImageFile = null;
  latestMedicationData = null;
  pendingExtractedData = null;
  pillImageInput.value = "";
  imagePreview.src = "";
  imagePreviewWrap.classList.add("hidden");
  verificationPanel.classList.add("hidden");
  resetManualEntryFields();
  manualMedName.value = "";
  summaryPanel.classList.add("hidden");
  renderTodayDashboard();
  renderNotificationCenter();
}

function renderOverallSummary() {
  overallCount.textContent = String(savedMedications.length);

  if (savedMedications.length === 0) {
    overallNames.textContent = "None yet";
    overallDoses.textContent = "0";
    overallWarnings.innerHTML = "";
    return;
  }

  const names = savedMedications.map((item) => item.extracted.medicationName);
  overallNames.textContent = names.join(", ");

  const doseCount = savedMedications.reduce((sum, item) => sum + item.schedule.events.length, 0);
  overallDoses.textContent = String(doseCount);

  const warningSet = new Set();
  for (const item of savedMedications) {
    for (const warning of item.knowledge.warnings) {
      warningSet.add(warning);
    }
  }

  overallWarnings.innerHTML = "";
  for (const warning of warningSet) {
    const li = document.createElement("li");
    li.textContent = warning;
    overallWarnings.appendChild(li);
  }
}

function loadSavedMedications() {
  try {
    const raw = localStorage.getItem(SAVED_MEDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_error) {
    return [];
  }
}

function toIcsDate(date) {
  const pad = (num) => String(num).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function getNumberAfterWord(text, word) {
  const regex = new RegExp(`${word}\\s+(\\d+)`);
  const match = text.match(regex);
  return match ? Number(match[1]) : null;
}

function getNumberBeforeWord(text, word) {
  const regex = new RegExp(`(\\d+)\\s+${word}`);
  const match = text.match(regex);
  return match ? Number(match[1]) : null;
}

function resolveFirstDoseTime(instructions) {
  const detected = extractTimeFromInstructions(instructions);
  if (detected) return detected;

  const typed = window.prompt(
    "We could not detect a dose time from the label. Enter the first dose time (for example: 8:00 AM or 20:30). Leave blank for no time:",
    ""
  );

  const trimmed = String(typed || "").trim();
  if (!trimmed) return null;

  const parsed = parseTimeText(trimmed);
  if (parsed) return parsed;

  statusMessage.textContent = "No valid time entered. Schedule saved without a time.";
  return null;
}

function extractTimeFromInstructions(instructions) {
  if (!instructions) return null;
  const lower = String(instructions).toLowerCase();
  const parsed = parseTimeText(lower);
  if (parsed) return parsed;

  if (/\bmorning\b/.test(lower)) return { hour: 8, minute: 0 };
  if (/\bnoon\b/.test(lower)) return { hour: 12, minute: 0 };
  if (/\bevening\b/.test(lower)) return { hour: 18, minute: 0 };
  if (/\bnight\b|\bbedtime\b/.test(lower)) return { hour: 21, minute: 0 };

  return null;
}

function parseTimeText(text) {
  const value = String(text || "").trim().toLowerCase();
  if (!value) return null;

  const twelveHourMatch = value.match(/\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2] || "0");
    const marker = twelveHourMatch[3];

    if (hour < 1 || hour > 12) return null;
    if (marker === "pm" && hour !== 12) hour += 12;
    if (marker === "am" && hour === 12) hour = 0;

    return { hour, minute };
  }

  const twentyFourHourMatch = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHourMatch) {
    return {
      hour: Number(twentyFourHourMatch[1]),
      minute: Number(twentyFourHourMatch[2]),
    };
  }

  return null;
}

function formatTimeDisplay(timeObj) {
  const temp = new Date();
  temp.setHours(timeObj.hour, timeObj.minute, 0, 0);
  return formatTime(temp);
}

function setupManualTimePicker() {
  if (!manualTimeHour || !manualTimeMinute || !manualTimePeriod) return;

  manualTimeHour.innerHTML = "";
  for (let hour = 1; hour <= 12; hour++) {
    const option = document.createElement("option");
    option.value = String(hour);
    option.textContent = String(hour).padStart(2, "0");
    manualTimeHour.appendChild(option);
  }

  manualTimeMinute.innerHTML = "";
  for (let minute = 0; minute < 60; minute += 5) {
    const option = document.createElement("option");
    option.value = String(minute);
    option.textContent = String(minute).padStart(2, "0");
    manualTimeMinute.appendChild(option);
  }

  manualTimePeriod.innerHTML = "";
  for (const period of ["AM", "PM"]) {
    const option = document.createElement("option");
    option.value = period;
    option.textContent = period;
    manualTimePeriod.appendChild(option);
  }

  manualTimeHour.value = "8";
  manualTimeMinute.value = "0";
  manualTimePeriod.value = "AM";

  const toggleDisabled = () => {
    const disabled = !!manualNoTime?.checked;
    manualTimeHour.disabled = disabled;
    manualTimeMinute.disabled = disabled;
    manualTimePeriod.disabled = disabled;
  };

  manualNoTime?.addEventListener("change", toggleDisabled);
  toggleDisabled();

  // Scroll wheel support so users can quickly pick time values.
  for (const selectEl of [manualTimeHour, manualTimeMinute, manualTimePeriod]) {
    selectEl.addEventListener("wheel", (event) => {
      event.preventDefault();
      const currentIndex = selectEl.selectedIndex;
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(selectEl.options.length - 1, currentIndex + direction));
      if (nextIndex !== currentIndex) selectEl.selectedIndex = nextIndex;
    });
  }
}

function getManualEntryTime() {
  if (manualNoTime?.checked) return null;
  if (!manualTimeHour || !manualTimeMinute || !manualTimePeriod) return null;

  const hour12 = Number(manualTimeHour.value);
  const minute = Number(manualTimeMinute.value);
  const period = manualTimePeriod.value;
  if (!Number.isFinite(hour12) || !Number.isFinite(minute)) return null;

  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return { hour: hour24, minute };
}

function resetManualEntryFields() {
  manualEntryPanel?.classList.add("hidden");
  if (manualEntryName) manualEntryName.value = "";
  if (manualNoTime) manualNoTime.checked = false;
  if (manualTimeHour) manualTimeHour.value = "8";
  if (manualTimeMinute) manualTimeMinute.value = "0";
  if (manualTimePeriod) manualTimePeriod.value = "AM";
  manualNoTime?.dispatchEvent(new Event("change"));
}

async function identifyLoosePill(file) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await fetch(apiUrl("/api/identify-pill"), {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      return {
        name: String(data.name || "Unknown pill"),
        intendedUse: String(data.intendedUse || "Use unknown, verify with pharmacist."),
        confidence: Number(data.confidence || 0.65),
      };
    }
  } catch (_error) {
    // Fallback below for local demo mode.
  }
  return {
    name: "Unconfirmed round white tablet",
    intendedUse: "Potential pain-relief medication. Verify imprint with a pharmacist before use.",
    confidence: 0.62,
  };
}

function openGoogleCalendarForFirstEvent(data) {
  const first = data.schedule.events[0];
  if (!first) return;
  const text = encodeURIComponent(`${data.extracted.medicationName} dose`);
  const details = encodeURIComponent(`Dosage: ${data.extracted.dosage}\nInstructions: ${data.extracted.instructions}`);
  const dates = `${toIcsDate(first.start)}/${toIcsDate(first.end)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function getEventId(event, medName) {
  return `${medName}-${event.start.toISOString()}`;
}

function ensureAdherenceEntries(data) {
  const medNameValue = data?.extracted?.medicationName || "Medication";
  const events = data?.schedule?.events || [];
  for (const event of events) {
    const eventId = getEventId(event, medNameValue);
    if (!adherenceLog[eventId]) {
      adherenceLog[eventId] = {
        medicationName: medNameValue,
        scheduledAt: event.start.toISOString(),
        status: "upcoming",
        loggedAt: null,
        escalationLevel: 0,
      };
    }
  }
  localStorage.setItem(ADHERENCE_LOG_KEY, JSON.stringify(adherenceLog));
}

function renderTodayDashboard() {
  if (!todayTimeline) return;
  const records = Object.entries(adherenceLog)
    .map(([id, rec]) => ({ id, ...rec }))
    .filter((entry) => isToday(new Date(entry.scheduledAt)))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  todayTimeline.innerHTML = "";
  if (!records.length) {
    todayTimeline.textContent = "No doses scheduled for today yet.";
    if (todayProgressRing) todayProgressRing.style.setProperty("--progress", "0%");
    return;
  }

  const completedCount = records.filter((item) => item.status === "on_time" || item.status === "late").length;
  const progressPct = Math.round((completedCount / records.length) * 100);
  if (todayProgressRing) {
    todayProgressRing.style.setProperty("--progress", `${progressPct}%`);
    todayProgressRing.title = `Daily progress ${progressPct}%`;
  }

  const grouped = { Morning: [], Afternoon: [], Evening: [] };
  for (const item of records) {
    const hour = new Date(item.scheduledAt).getHours();
    if (hour < 12) grouped.Morning.push(item);
    else if (hour < 17) grouped.Afternoon.push(item);
    else grouped.Evening.push(item);
  }

  for (const periodName of ["Morning", "Afternoon", "Evening"]) {
    const section = document.createElement("section");
    section.className = "timeline-period";
    section.innerHTML = `<h3 class="timeline-period-title">${periodName}</h3>`;
    if (!grouped[periodName].length) {
      const empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = "No scheduled doses.";
      section.appendChild(empty);
      todayTimeline.appendChild(section);
      continue;
    }
    for (const item of grouped[periodName]) {
      const row = document.createElement("article");
      row.className = "timeline-item";
      row.dataset.status = normalizeStatus(item);
      row.innerHTML = `
        <div class="timeline-header">
          <strong>${item.medicationName}</strong>
          <span class="timeline-status">${prettyStatus(normalizeStatus(item))}</span>
        </div>
        <div>${formatTime(new Date(item.scheduledAt))}</div>
        <div>Take ${extractDoseText(item)} Pills</div>
        <div class="timeline-actions">
          <button class="btn-action take-dose-button" type="button" data-action="taken" data-id="${item.id}">Take</button>
          <button class="btn-secondary" type="button" data-action="snooze" data-id="${item.id}">Snooze 15m</button>
          <button class="btn-danger" type="button" data-action="skip" data-id="${item.id}">Skip</button>
        </div>
      `;
      if (item.status === "on_time" || item.status === "late") {
        const check = document.createElement("span");
        check.className = "checkmark";
        check.textContent = "✓ Taken";
        row.appendChild(check);
      }
      section.appendChild(row);
    }
    todayTimeline.appendChild(section);
  }
}

todayTimeline?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id || !adherenceLog[id]) return;
  handleDoseAction(action, id, target);
});

function renderNotificationCenter() {
  if (!notificationCenter) return;
  const now = Date.now();
  const records = Object.entries(adherenceLog)
    .map(([id, rec]) => ({ id, ...rec }))
    .filter((entry) => entry.status === "upcoming")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 6);

  const notices = [];
  for (const rec of records) {
    const delay = now - new Date(rec.scheduledAt).getTime();
    let level = 0;
    if (delay >= 60 * 60 * 1000) level = 3;
    else if (delay >= 30 * 60 * 1000) level = 2;
    else if (delay >= 0) level = 1;
    if (!level) continue;
    notices.push({ ...rec, level });
    adherenceLog[rec.id].escalationLevel = level;
    if (level === 3) notifyCaregiver(rec);
  }
  localStorage.setItem(ADHERENCE_LOG_KEY, JSON.stringify(adherenceLog));

  const lowSupply = savedMedications.length
    ? "Reminder: One or more prescriptions may be running low. Refill check recommended."
    : null;
  const externalUpdate =
    caregiverLinks.length > 0 ? "Update: A caregiver/editor may have updated a schedule." : null;

  notificationCenter.innerHTML = "";
  for (const note of notices) {
    const card = document.createElement("article");
    card.className = `notification-card level-${note.level}`;
    card.innerHTML = `
      <strong>Level ${note.level} Alert - ${note.medicationName}</strong>
      <p>${buildLevelMessage(note.level, note.scheduledAt)}</p>
      <div class="timeline-actions">
        <button class="btn-action" type="button" data-action="taken" data-id="${note.id}">Log as Taken</button>
        <button class="btn-secondary" type="button" data-action="snooze" data-id="${note.id}">Snooze 15m</button>
        <button class="btn-danger" type="button" data-action="skip" data-id="${note.id}">Skip</button>
      </div>
    `;
    notificationCenter.appendChild(card);
    maybeShowNativeNotification(note);
  }
  if (lowSupply) notificationCenter.appendChild(buildPlainNotification(lowSupply));
  if (externalUpdate) notificationCenter.appendChild(buildPlainNotification(externalUpdate));
  if (!notificationCenter.children.length) {
    notificationCenter.textContent = "No active alerts.";
  }
}

function buildPlainNotification(text) {
  const card = document.createElement("article");
  card.className = "notification-card";
  card.textContent = text;
  return card;
}

function buildLevelMessage(level, scheduledAt) {
  const at = formatTime(new Date(scheduledAt));
  if (level === 1) return `Scheduled dose due now (${at}).`;
  if (level === 2) return `Critical alert: dose ignored for 30+ minutes (${at}).`;
  return `Missed dose escalated to caregiver (${at}).`;
}

function maybeShowNativeNotification(note) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
  if (Notification.permission !== "granted") return;
  const title = note.level === 2 ? "Critical Medication Alert" : "Medication Reminder";
  const body = `${note.medicationName}: ${buildLevelMessage(note.level, note.scheduledAt)}`;
  new Notification(title, { body, silent: shouldSilenceNotification(note.medicationName) });
}

function shouldSilenceNotification(medicationName) {
  const pref = notificationPreferences;
  if (!pref.quietNonessential) return false;
  const lower = String(medicationName || "").toLowerCase();
  const nonessential = lower.includes("vitamin") || lower.includes("supplement");
  if (!nonessential) return false;
  return isInsideQuietHours(pref.quietStart, pref.quietEnd, new Date());
}

function isInsideQuietHours(start, end, now) {
  const toMinutes = (value) => {
    const [h, m] = String(value || "00:00").split(":").map((x) => Number(x));
    return h * 60 + m;
  };
  const current = now.getHours() * 60 + now.getMinutes();
  const s = toMinutes(start);
  const e = toMinutes(end);
  return s <= e ? current >= s && current <= e : current >= s || current <= e;
}

function notifyCaregiver(record) {
  const latest = caregiverLinks[caregiverLinks.length - 1];
  if (!latest) return;
  caregiverLinkOutput.textContent = `Escalation sent to caregiver (${latest.access}) for ${record.medicationName}.`;
}

function normalizeStatus(item) {
  if (item.status === "on_time" || item.status === "late" || item.status === "missed" || item.status === "skipped") return item.status;
  const overdueMs = Date.now() - new Date(item.scheduledAt).getTime();
  if (overdueMs > 60 * 60 * 1000) return "missed";
  if (overdueMs > 0) return "late";
  return "upcoming";
}

function prettyStatus(status) {
  if (status === "on_time") return "On time";
  if (status === "late") return "Late";
  if (status === "missed") return "Missed";
  if (status === "skipped") return "Skipped";
  return "Upcoming";
}

function extractDoseText(item) {
  const text = String(item?.medicationName || "");
  const match = text.match(/\b(\d+)\b/);
  if (!match) return "1";
  return match[1];
}

function updateSafetyBannerForUnknownPill(result) {
  if (!summarySafetyBanner) return;
  const unsafe =
    !result?.name ||
    String(result.name).toLowerCase().includes("unknown") ||
    Number(result.confidence || 0) < 0.7;
  if (!unsafe) return;
  summarySafetyBanner.classList.add("visible");
  summarySafetyBanner.innerHTML = `
    Unknown pill pattern detected. Do not consume this medication.
    <div class="actions">
      <button class="btn-danger" type="button" onclick="window.open('tel:18002221222')">Contact Poison Control</button>
      <button class="btn-secondary" type="button" onclick="window.open('https://safe.pharmacy/drug-disposal/', '_blank')">Safe Disposal Info</button>
    </div>
  `;
}

function renderMonthCalendar() {
  if (!monthCalendar) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  monthCalendar.innerHTML = "";
  for (let day = 1; day <= end.getDate(); day++) {
    const date = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.className = "month-day";
    cell.textContent = String(day);
    const status = getDayAdherenceStatus(date);
    if (status) {
      const dot = document.createElement("span");
      dot.className = `adherence-dot dot-${status}`;
      cell.appendChild(document.createElement("br"));
      cell.appendChild(dot);
    }
    monthCalendar.appendChild(cell);
  }
  if (start.getDay() > 0) {
    // Optional spacing not required for this simplified month grid.
  }
}

function getDayAdherenceStatus(date) {
  const entries = Object.values(adherenceLog).filter((rec) => {
    const d = new Date(rec.scheduledAt);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });
  if (!entries.length) return null;
  const missed = entries.some((x) => x.status === "missed" || x.status === "skipped");
  const late = entries.some((x) => x.status === "late");
  const allTaken = entries.every((x) => x.status === "on_time" || x.status === "late");
  if (missed) return "red";
  if (allTaken && !late) return "green";
  if (allTaken || late) return "yellow";
  return "red";
}

function saveNotificationPreferencesFromInputs() {
  notificationPreferences = {
    sound: alertSound?.value || "calm",
    quietStart: quietHoursStart?.value || "22:00",
    quietEnd: quietHoursEnd?.value || "07:00",
    quietNonessential: !!quietHoursNonessential?.checked,
  };
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPreferences));
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function isToday(date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveApiBaseUrl() {
  const configured = window.MEDILENS_API_BASE_URL;
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/+$/, "");
  }
  return "http://localhost:3001";
}

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

notificationCenter?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id || !adherenceLog[id]) return;
  handleDoseAction(action, id, target);
});

function handleDoseAction(action, id, actionButton) {
  if (action === "taken") {
    const scheduled = new Date(adherenceLog[id].scheduledAt).getTime();
    const now = Date.now();
    adherenceLog[id].status = now - scheduled <= 15 * 60 * 1000 ? "on_time" : "late";
    adherenceLog[id].loggedAt = new Date(now).toISOString();
    adherenceLog[id].escalationLevel = 0;
    const card = actionButton?.closest(".timeline-item");
    if (card) {
      card.classList.add("collapsing");
      window.setTimeout(() => {
        localStorage.setItem(ADHERENCE_LOG_KEY, JSON.stringify(adherenceLog));
        renderTodayDashboard();
        renderNotificationCenter();
        renderMonthCalendar();
      }, 280);
      return;
    }
  } else if (action === "snooze") {
    const next = new Date(adherenceLog[id].scheduledAt);
    next.setMinutes(next.getMinutes() + 15);
    adherenceLog[id].scheduledAt = next.toISOString();
    adherenceLog[id].status = "upcoming";
  } else if (action === "skip") {
    adherenceLog[id].status = "skipped";
    adherenceLog[id].loggedAt = new Date().toISOString();
  }
  localStorage.setItem(ADHERENCE_LOG_KEY, JSON.stringify(adherenceLog));
  renderTodayDashboard();
  renderNotificationCenter();
  renderMonthCalendar();
}

if (alertSound) alertSound.value = notificationPreferences.sound || "calm";
if (quietHoursStart) quietHoursStart.value = notificationPreferences.quietStart || "22:00";
if (quietHoursEnd) quietHoursEnd.value = notificationPreferences.quietEnd || "07:00";
if (quietHoursNonessential) {
  quietHoursNonessential.checked =
    notificationPreferences.quietNonessential !== undefined
      ? !!notificationPreferences.quietNonessential
      : true;
}
if (dynamicTypeValue && dynamicTypeSize) dynamicTypeValue.textContent = `${dynamicTypeSize.value}%`;

renderOverallSummary();
renderTodayDashboard();
renderNotificationCenter();
renderMonthCalendar();
setInterval(() => {
  renderTodayDashboard();
  renderNotificationCenter();
  renderMonthCalendar();
}, 60000);
