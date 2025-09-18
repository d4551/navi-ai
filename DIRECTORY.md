Repository Structure and Conventions

Overview

- This document summarizes the repository layout, what lives where, and how to run common scripts and manual demos after the reorganization.

Top‑Level

- `src/` — Application source (Vue, TypeScript, composables, services)
- `public/` — Static assets served as‑is
- `electron/` — Electron main/preload code and packaging
- `scripts/` — Developer and utility scripts
  - `scripts/dev/` — One‑off developer utilities and quick fixes
  - `scripts/data-import/` — Data import/export helpers (e.g., Steam imports)
  - `scripts/tests/` — Node scripts for ad‑hoc testing by domain
    - `ai/`, `steam/`, `studio/`, `kokoro/`, `audio/`, `tts/`
  - `scripts/codemods/` — Codemods and refactors (e.g., mdi → AppIcon)
- `docs/` — Documentation, demos, and manual tests
  - `docs/demos/` — Small UI/demo HTML files
  - `docs/manual-tests/` — Browser‑only test pages and helpers
- `apps-script/` — Google Apps Script sources (moved from repo root)
- `test/`, `src/test/` — Vitest test suites
- `test-data/` — Local fixtures (e.g., sqlite)
- `dist/` — Build outputs (ignored by VCS)
- `index.html` — App entry (dev/prod CSP handling)
- `vite.config.js`, `vitest.config.js`, `tsconfig*.json` — Tooling configs

Recently Moved Files (canonical locations)

- Apps Script
  - `apps-script/ApiHandler.gs`
  - `apps-script/ChatManager.gs`
  - `apps-script/Code.gs`
  - `apps-script/DocumentManager.gs`
  - `apps-script/StyleManager.gs`
  - `apps-script/TemplateService.gs`
  - `apps-script/Utils.gs`

- Demos and Manual Browser Tests
  - `docs/demos/consolidation-showcase.html`
  - `docs/demos/debug-tts-key.html`
  - `docs/demos/demo-ui-enhancement.html`
  - `docs/manual-tests/test-gamification.html`
  - `docs/manual-tests/test-gamification.js`
  - `docs/manual-tests/test-ai-orchestration.html`
  - `docs/manual-tests/test-ai-orchestration.js`
  - `docs/manual-tests/test-achievement-modal.html`
  - `docs/manual-tests/test-achievement-popup.js`
  - `docs/manual-tests/test-google-ai-tts-browser.js`

- Data Import & Dev Utilities
  - `scripts/data-import/complete-steam-import.js`
  - `scripts/dev/debug-steam-api.ts`
  - `scripts/dev/discover-kokoro-api.js`
  - `scripts/dev/configure-api.js`
  - `scripts/dev/fix-tts-setting.js`

- Node Test Utilities (ad‑hoc)
  - `scripts/tests/ai/test-google-ai-connection.js`
  - `scripts/tests/ai/test-api-key.js`
  - `scripts/tests/ai/comprehensive-ai-verification.js`
  - `scripts/tests/steam/test-steam-import.{js,ts}`
  - `scripts/tests/steam/test-steam-data-source.ts`
  - `scripts/tests/steam/test-steam-filters.ts`
  - `scripts/tests/studio/test-studio-import-integration.ts`
  - `scripts/tests/kokoro/test-{final,corrected,package,local, integration}.js`
  - `scripts/tests/audio/test-fairy-audio-key.js`
  - `scripts/tests/tts/test-tts-timeout-fix.js`

How to Run Things

- App (web): `npm run dev` → open http://127.0.0.1:5173
- App (desktop): `npm run electron-dev`
- Lint: `npm run lint` (auto‑fix: `npm run lint:fix-all`)
- Unit/Integration tests: `npm run test` (or `npm run test:run`)

Manual Browser Tests

- Open files under `docs/manual-tests/` directly in a browser (file://) or serve them with a simple static server.
  - Example: `docs/manual-tests/test-gamification.html` loads `./test-gamification.js` relatively.

Dev/Ad‑hoc Scripts

- From repo root, run with Node, e.g.:
  - `node scripts/data-import/complete-steam-import.js`
  - `node scripts/tests/ai/test-google-ai-connection.js`
  - `node scripts/dev/configure-api.js`

Conventions

- Keep runtime app code in `src/` and tests in `test/` or `src/test/`.
- Place standalone developer scripts in `scripts/` under an appropriate domain folder.
- Place one‑off demo pages and manual tests under `docs/`.
- Avoid adding new files to the project root unless they are top‑level configs or docs.
