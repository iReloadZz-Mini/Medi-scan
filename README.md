# MediLens

Mobile-first web app for medication tracking and scheduling from prescription bottle photos.

## What is implemented

- Photo upload + AI extraction flow
- Confidence check with manual verification/retake prompt
- Medication summary dashboard
- Save multiple medications and aggregate overall summary
- Smart schedule generation
- `.ics` export for calendar import
- Backend endpoint for vision extraction using Groq API

## One-time setup

1. Install Node.js LTS.
2. In this folder, install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`.
4. Put your rotated Groq key in `.env`:

```env
GROQ_API_KEY=your_new_rotated_key_here
PORT=3001
```

## Run app

1. Start backend:

```bash
npm start
```

2. Open `index.html` in your browser.
3. Upload pill bottle image and click **Analyze Label**.

## Deploy for sharing (Option 3)

Use this if your teacher should open a link and use AI features without local setup.

### 1) Deploy backend (Render)

1. Push this project to GitHub.
2. In Render, click **New +** -> **Web Service** and connect your repo.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variable:
   - `GROQ_API_KEY` = your Groq API key
5. Deploy and copy your backend URL, for example:
   - `https://medilens-api.onrender.com`

### 2) Point frontend to deployed backend

In `index.html`, update:

```html
window.MEDILENS_API_BASE_URL = "https://your-render-backend-url.onrender.com";
```

This line is near the bottom of the file, right before `app.js`.

### 3) Host frontend

Host the static frontend on Netlify or Vercel, then share that URL.

### 4) Verify before sharing

Open the hosted frontend and test:
- Analyze Label
- AI Summary
- Loose Pill Identify

If AI requests fail, confirm backend URL in `index.html` and backend env vars in Render.

## API endpoint

- `POST /api/extract-medication`
- form-data field: `image`
- returns:

```json
{
  "medicationName": "string",
  "dosage": "string",
  "instructions": "string",
  "confidence": 0.92
}
```
