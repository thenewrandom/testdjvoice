# DJ Copilot AI Pro

AI-powered browser DJ booth built with React, Vite, Tailwind CSS and Gemini.

## What's upgraded

- Server-side Gemini DJ script generation through `/api/dj-script`.
- Realistic Gemini neural TTS through `/api/dj-tts`, replacing browser-only computer voices when the API is configured.
- Persona-specific voice selection and performance direction.
- Browser speech remains as a fallback if Gemini TTS is unavailable.
- API keys are kept server-side instead of shipping `GEMINI_API_KEY` to the browser.
- Vercel-ready Vite configuration.
- Smarter local setlist selection using persona genre, BPM range, energy and Sound Benders priority.

## Run locally

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` and provide `GEMINI_API_KEY`.

## Vercel deployment

Import this project into Vercel. Vercel detects Vite and builds the static frontend into `dist`; the `api/` TypeScript files become serverless endpoints.

Add these Environment Variables in the Vercel project settings:

- `GEMINI_API_KEY` — required
- `GEMINI_TEXT_MODEL` — optional, defaults to `gemini-2.5-pro`
- `GEMINI_TTS_MODEL` — optional, defaults to `gemini-2.5-flash-preview-tts`

Do not commit `.env` or expose the Gemini key through a `VITE_` variable.
