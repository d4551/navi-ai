Google AI Studio (Gemini) Integration Notes

Location: `electron/services/AIService.js` (main process)

- Client: `@google/generative-ai`
- Methods:
  - `initialize(apiKey, modelId)` sets up client + model with generation and safety config.
  - `generateText(prompt, { systemInstructions?, options? })` returns `{ text, usageMetadata, latencyMs, ... }`.
  - `streamText(prompt, { systemInstructions?, options? })` is an async iterator yielding `{ chunk, aggregate }` and returns `{ done, latencyMs }` at completion.
  - `transcribeAudio({ base64, mimeType, language? })` sends inline audio for transcription with a text-only response.
  - `listModels()` returns curated, known-good Gemini models for the UI.
  - `getStatus()`, `getMetrics()`, `reset()` for health/ops.

Renderer Use
- `src/utils/aiClient.js` provides a single source of truth:
  - Text: `generateContent(prompt, system, options)`
  - Streaming: `streamText({ prompt, systemInstructions, options }, { onChunk, onComplete, onError })`
  - Extras: `generateSmartContent`, `mapSkills`, `scoreResume`, `listModels`, etc.

Audio Pipelines
- STT: Renderer records mic via `AudioService` → sends Base64 audio via IPC `audio-stt-transcribe` → `transcribeAudio()` in main → transcript to UI.
- TTS: Renderer calls `api.audio.ttsSpeak({ provider: 'gemini', ... })`; currently routes to renderer system TTS with future space for Gemini audio when supported.

Security
- API key never exposed to renderer; it’s passed once via IPC to main for initialization.
- All IPC payloads validated and sanitized; rate-limited in preload.
