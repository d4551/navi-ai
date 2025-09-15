https://private-user-images.githubusercontent.com/78459116/489319498-4a4cd685-c97d-44c2-97a9-c653638590a3.mp4?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTc4ODQ1MDQsIm5iZiI6MTc1Nzg4NDIwNCwicGF0aCI6Ii83ODQ1OTExNi80ODkzMTk0OTgtNGE0Y2Q2ODUtYzk3ZC00NGMyLTk3YTktYzY1MzYzODU5MGEzLm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA5MTQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwOTE0VDIxMTAwNFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWU5MzRmMGUyYWNlM2YyNjFmNDEyYzY2NTJhZjIyM2EzMWNkZTkzYzBmNTBmYmE1MjA0Mjg0NDc2MGJkMmFjYzAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.JXhDAp118NBDB0dgXb2Aua8HY5c9txCUvlo1ZyJtVj0


# NAVI - AI-Powered Gaming Career Assistant


<p align="center">
  <img src="navi_s.gif" alt="NAVI demo" width="720" />
</p>


<p align="center">
  <video src="navi_s.mp4" controls width="720" poster="docs/screenshots/enhanced-gaming-dashboard.png"></video>
</p>


<p align="center">
  <h1 align="center">HEY! LISTEN!</h1>
</p>

<p align="center">
  The <em>world's first</em> <strong>source-available (noncommercial), multimodal, gamified</strong> job platform built <em>specifically</em> for the video-game industry.<br/>
  <strong>Version 1.0.0 - Stable</strong> | Free. No strings. No gacha. Only jobs.
</p>

<p align="center">
  <a href="https://github.com/d4551/navi-ai/releases">
    <img alt="Version 1.0.0" src="https://img.shields.io/badge/version-1.0.0-brightgreen">
  </a>
  <a href="https://github.com/d4551/navi-ai/blob/main/LICENSE">
    <img alt="License: NaviAI-NCPL-1.1" src="https://img.shields.io/badge/License-NaviAI--NCPL--1.1-blue">
  </a>
  <a href="https://github.com/d4551/navi-ai/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/d4551/navi-ai.svg?style=social">
  </a>
  <br/>
  <a href="#">
    <img alt="Status: Stable" src="https://img.shields.io/badge/status-stable-brightgreen">
  </a>
  <a href="#">
    <img alt="Multimodal AI" src="https://img.shields.io/badge/AI-Multimodal%20(voice%2Fvideo%2Fvision)-purple">
  </a>
  <a href="#">
    <img alt="Industry" src="https://img.shields.io/badge/Focus-Video%20Game%20Jobs-black">
  </a>
  <a href="#">
    <img alt="Free" src="https://img.shields.io/badge/Pricing-Free-%23A3E635">
  </a>
  <a href="https://github.com/d4551/navi-ai/actions">
    <img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/d4551/navi-ai/ci.yml">
  </a>
</p>

---

## 📖 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🧭 TL;DR](#-tldr)
- [🎯 Features](#-features)
- [🖼️ Screenshots](#-screenshots)
- [🔮 What's Coming](#-whats-coming)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🛠️ Development](#-development)
- [🤝 Contributing](#-contributing)
- [📚 Documentation](#-documentation)
- [📜 License](#-license)
- [🙏 Credits](#-credits)
- [📈 Recent Updates](#-recent-updates)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/d4551/navi-ai.git
cd navi-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Or run the Electron app
npm run electron-dev
```

**That's it!** NAVI works immediately with no account required. Add your Google AI Studio API key in Settings for enhanced AI features.

Note (macOS): If `npm install` warns about engines for Redocly or hits a permission snag for `electron-builder`, see Troubleshooting below — it’s a quick fix.

---

## 🧭 TL;DR

**NAVI v1.0.0** is a polished, source-available (noncommercial), multimodal, gamified career platform built for the video‑game industry. It helps you **find verified game‑industry jobs**, **tailor ATS‑ready resumes/CVs**, **practice with mock interviews using studio‑style personas**, **get actionable coaching**, and **ship a clean portfolio**—all with **real‑time, multimodal Gemini** support. Local‑first, privacy‑aware, and fast.

---

## ✅ What’s Solid in 1.0

- **Gaming Multi-source Job Board**: Gaming‑focused aggregation with improved search, sorting, and de‑dupe.
- **ATS‑Smart Documents**: Resume/CV + cover letter builder with export and templating.
- **AI Workflows**: Context‑aware prompts for tailoring resumes and job matching.
- **Mock Interviews**: Studio‑style question banks with timed sessions and feedback.
- **Portfolio Basics**: Projects overview with exportable sections and PDF snapshots.
- **Desktop + Web**: Electron app for local persistence and a Vite web dev workflow.
- **Privacy First**: Keys stored locally; nothing sent unless you opt‑in.

---

## 🎯 Features (v1.0.0)

### 🎮 Job Search (Gaming‑Focused)

- **Providers**: Greenhouse/Lever studio boards with source‑aware parsing.
- **Search & Filter**: Keywords, location, seniority; de‑duplication across sources.
- **Details**: Clean descriptions, requirements, and outbound application links.

### 🤖 AI Integration

- **Gemini**: Tailored prompts for resume alignment and job matching.
- **Review & Feedback**: Quick gap analysis and phrasing suggestions.
- **Configurable**: Toggle models, context windows, and privacy levels.

### 📄 Document Builder

- **Templates**: ATS‑friendly resume and cover letter baselines.
- **Export**: PDF and sharable outputs.
- **Profiles**: Multiple role profiles for rapid tailoring.

### 🧪 Interviews

- **Personas**: Studio‑style interview sets and timed practice.
- **Scoring**: Lightweight rubrics and improvement pointers.

### 🖼️ Portfolio

- **Projects**: Simple showcases and printable summaries.

### ⚙️ Platform

- **Vue 3 + Vite + Electron** with type‑safe IPC and hardened preload.
- **Local‑first** settings and secure key storage (Electron).

> 🎮 **[See the complete feature list with detailed screenshots →](featurelist.md)**

## 🖼️ Screenshots

Below are representative screens from the current release. Higher‑resolution images live in `docs/screenshots/`.

![Enhanced Gaming Dashboard](docs/screenshots/enhanced-gaming-dashboard.png)
_Gaming career dashboard with real‑time job matching._

![AI Interview Preparation](docs/screenshots/ai-interview-preparation.png)
_Mock interview interface with timed sessions and feedback._

![AI Modal System](docs/screenshots/ai-modal-system.png)
_Context‑aware AI assistance modal._

![AI Resume Builder](docs/screenshots/ai-resume-builder.png)
_ATS‑friendly resume/CV builder with live AI feedback._

![Enhanced Job Board](docs/screenshots/enhanced-job-board.png)
_Gaming‑focused job board with advanced filters and de‑duplication._

---

## 🚀 Roadmap (1.0.0 → 1.2.0)

**Current Status**: v1.0.0 stable.

### 🔄 v1.1.0 (Quality + DX)

- Saved searches and job alerts
- Richer filtering and sorting
- Better accessibility and keyboard flow
- Expanded provider registry

### 🚀 v1.2.0 (Experience)

- Portfolio media support and theming
- Interview analytics and answer playback
- Studio intelligence snapshots

### 🎯 Later

- Multimodal voice/video analysis
- Community templates and sharing
- Mobile tweaks and packaging improvements

---

## 🛠️ Under the Hood (peek)

- **Stack**: Vue 3 + Vite + Electron, Type-safe IPC, secure preload, local storage for keys.
- **AI**: Google **Gemini** (text, audio, and vision) for generation, mapping, and interviews.
- **Multimodal**: Live video & screen-sharing with frame-by-frame AI insights.
- **Privacy**: Local-first; only what you choose is sent to AI; keys never committed.

---

## 📦 Installation

### Prerequisites

- Node.js >= 20.19.0 (or Node 22.12+) — 20 LTS recommended
- npm 10+
- For native modules on Windows (better-sqlite3, keytar):
  - Python 3 (added to PATH)
  - Visual Studio Build Tools (C++ Desktop workload)

### Quick Start (Desktop/Electron)

- Clone and install: `npm install`
- Dev mode (starts Vite + Electron): `npm run electron-dev`
- Production preview (local build): `npm run build && npm run electron`
- Package installers (Win/Mac/Linux): `npm run electron-build`

### Quick Start (Web Only)

- Dev server: `npm run dev` then open the shown URL
- Preview a production build: `npm run build && npm run preview`

### Notes (Usage)

- To use a custom dev port for Electron: `VITE_PORT=5180 npm run electron-dev:port`
- App settings persist locally; API keys are stored on your device and never committed.
- First run may take a minute while dependencies build native modules.

### Troubleshooting

- If Electron can't find the dev server, ensure Vite is running on the same port or use `electron-dev` which starts both.
- Clear caches on odd rebuild issues: `npm run clean` (or `clean:all` to remove `node_modules`).
- Windows PowerShell users may prefer `electron-dev` over `electron-dev:port` due to shell env syntax differences.
- Rebuild native modules for Electron if launch fails: `npm run rebuild:native`

#### macOS: electron-builder permission denied (code 126)

If you see `sh: node_modules/.bin/electron-builder: Permission denied` during install:

```bash
# Remove quarantine flags and add exec bits to local binaries
xattr -dr com.apple.quarantine node_modules/.bin || true
find node_modules/.bin -type f ! -name "*.cmd" ! -name "*.ps1" -exec chmod +x {} +

# Re-run just the native deps step (optional)
npx electron-builder install-app-deps
```

You can also skip the postinstall step entirely and run it later:

```bash
NAVI_SKIP_POSTINSTALL=1 npm install
npx electron-builder install-app-deps
```

#### EBADENGINE warnings for Redocly

Some dev-only docs tooling (`@redocly/*`) requires Node >= 20.19 or 22.12. If your Node is slightly older (e.g., 20.18.x), you may see harmless `npm WARN EBADENGINE` during install. Either:

- Upgrade Node to 20.19+ (recommended), or
- Ignore the warnings if you aren’t generating docs.

To generate/update API docs later:

```bash
npm run api:docs   # builds docs/api.html from docs/openapi.yaml
```

---

## 🚀 Usage

### Gaming Job Board Setup

- Configure Gemini: In-app go to Settings and paste your Google AI Studio API key (uses gemini-2.5-flash by default).
- Enable studio job sources: Edit `src/services/providers/companyBoards.ts` to add or tweak ATS board tokens (Greenhouse/Lever). A few popular studios are prefilled.
- Run locally:
  - Web: `npm run dev` (open Job Board view)
  - Desktop: `npm run electron-dev`
- Search and AI match: Use the Job Board to search; click "AI Job Matching" to rank jobs to your profile using Gemini.

### Notes

- The job aggregator includes source-available (noncommercial) plus per-studio ATS providers (Greenhouse, Lever, etc.). If a studio returns empty results, verify the token by visiting its public board URL (see comments in `companyBoards.ts`).
- You can extend providers or change priorities via the pluggable registry in `src/services/RefactoredJobAPIService.ts`.

### Update (Jobs Platform Consolidation)

- Canonical job route is `/jobs`. Any `/gaming-jobs` links now point to the same unified implementation.
- Canonical job service is `src/services/CanonicalJobService.ts` (re-exports the provider-based service).
- Page pointers are de-duplicated; all job board references resolve to the unified JobSearch view.
- Theme aligns to a black/white glass design with RGB neon accents for hover/focus.

---

## 🛠️ Development

### Prerequisites (Development)

- **Node.js** >= 18 (20 LTS recommended)
- **npm** 9+ (bundled with Node installs)
- **Git** for version control
- For native modules on Windows:
  - Python 3 (added to PATH)
  - Visual Studio Build Tools (C++ Desktop workload)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/d4551/navi-ai.git
cd navi-ai

# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Or run Electron app in development
npm run electron-dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```text
src/
├── components/          # Vue components
├── composables/         # Vue composables
├── services/           # API services
├── views/              # Page components
├── modules/            # Business logic modules
├── styles/             # CSS and styling
└── utils/              # Utility functions

electron/               # Electron main process
public/                 # Static assets
scripts/                # Build and utility scripts
docs/                   # Documentation
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run electron-dev` | Start Electron in development mode |
| `npm run electron-build` | Build Electron installers |
| `npm test` | Run test suite |
| `npm run lint` | Lint and fix code |
| `npm run clean` | Clean build artifacts |

### Architecture

- **Frontend**: Vue 3 + Vite + Vuetify
- **Backend**: Electron + Node.js
- **Database**: SQLite with better-sqlite3
- **AI**: Google Gemini API integration
- **Security**: Keytar for secure credential storage

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Ways to Contribute

- 🐛 **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- ✨ **Feature Requests**: Open issues with "enhancement" label
- 🛠️ **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Improve docs, add examples, fix typos
- 🎨 **UI/UX**: Design improvements and accessibility enhancements
- 🧪 **Testing**: Add tests, improve test coverage

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/navi-ai.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly: `npm test`
6. **Commit** with clear messages: `git commit -m "Add amazing feature"`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Code Standards

- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.js
```

### Reporting Issues

When reporting bugs, please include:
- NAVI version
- Operating system and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors/logs

---

## 📚 Documentation

- **[Feature List](featurelist.md)** - Complete feature overview with screenshots
- **[API Documentation](docs/api.html)** - Technical API reference
- **[Directory Structure](DIRECTORY.md)** - Project organization guide
- **[Component Standards](COMPONENT_NAMING_STANDARDS.md)** - Component naming conventions
- **[Container Standards](CONTAINER_STANDARDS.md)** - Container component guidelines

---

## 💖 Community

- ⭐ Star the repo and watch for updates
- 🐛 File issues, request features, or submit PRs
- 🎨 Share templates (resumes, portfolios, interview banks)
- 🎥 Post "from jam to job" success stories
- 💬 Join our [Discord](https://discord.gg/6p52QZ2sAm)

---

## 📣 Call for Studios & Recruiters

Want better signal and happier candidates? Open an issue to add your **personas**, **pipelines**, and **best-practice prompts**. We'll make it painless (and a little bit fun).

---

## 📈 Release History

### v1.0.0 — Stable
- ✅ Unified gaming job board with improved search and de‑duplication
- ✅ ATS‑friendly resume/CV and cover letter builder with export
- ✅ Gemini‑powered tailoring, gap analysis, and job matching
- ✅ Mock interviews with studio‑style question sets and feedback
- ✅ Portfolio basics with exportable sections
- ✅ Electron + Web dev flow, local‑first settings and key storage

---

## 🧾 License & Credits

- **Dr. Brandon Donnelly (Happy Mask Salesman)** — LinkedIn: [https://www.linkedin.com/in/stracos](https://www.linkedin.com/in/stracos)
- **License**: Navi AI NonCommercial Public License v1.1 (SPDX: LicenseRef-NaviAI-NCPL-1.1). Source-available, noncommercial; not an OSI-approved source-available (noncommercial) license.
- **AI**: Uses your **Google AI Studio** key; real-time conversations powered by Gemini (free tier available).
- **Name**: NAVI CV — because sometimes you really do need a tiny glowing helper yelling "Hey! Listen!"

<p align="center"><em>"You've never been quite so Breath-of-the-Hired."</em></p>

---

## 📈 Recent Updates

- Install: Clarified Node requirement (>= 20.19 or 22.12+) to satisfy docs tooling (`@redocly/*`). Older 20.x may see harmless `EBADENGINE` warnings.
- macOS: Added a quick fix for `electron-builder` permission denied (code 126) during `npm install` — remove quarantine + set exec bits, or skip postinstall via `NAVI_SKIP_POSTINSTALL=1`.
- Docs: Linked `npm run api:docs` for generating `docs/api.html` when Redocly is available.

If you run into anything weird, ping issues — we’ll squish it.

## Repository Layout

See [DIRECTORY.md](DIRECTORY.md) for the full repo structure, where scripts/tests/demos live, and how to run them after the reorganization.

![NAVI Fox Loves Helping!](heyLISTEN.jpg)







