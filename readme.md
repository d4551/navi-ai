# NAVI - AI-Powered Gaming Career Assistant

![NAVI Fox Loves Helping!](heyLISTEN.jpg)

<p align="center">
  <h1 align="center">HEY! LISTEN!</h1>
</p>

<p align="center">
  The <em>world's first</em> <strong>source-available (noncommercial), multimodal, gamified</strong> job platform built <em>specifically</em> for the video-game industry.<br/>
  <strong>Version 0.0.1 - Alpha Release</strong> | Free. No strings. No gacha. Only jobs.
</p>

<p align="center">
  <a href="https://github.com/d4551/navi-ai/releases">
    <img alt="Version 0.0.1" src="https://img.shields.io/badge/version-0.0.1-orange">
  </a>
  <a href="https://github.com/d4551/navi-ai/blob/main/LICENSE">
    <img alt="License: NaviAI-NCPL-1.1" src="https://img.shields.io/badge/License-NaviAI--NCPL--1.1-blue">
  </a>
  <a href="https://github.com/d4551/navi-ai/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/d4551/navi-ai.svg?style=social">
  </a>
  <br/>
  <a href="#">
    <img alt="Status: Alpha" src="https://img.shields.io/badge/status-alpha-red">
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
- [🔮 What's Coming](#-whats-coming)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🛠️ Development](#️-development)
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

---

## 🧭 TL;DR

**NAVI v0.0.1** is an early alpha release of the world's first source-available (noncommercial), multimodal, gamified job platform built specifically for the video-game industry. It helps you **find game-industry jobs**, **tailor ATS-ready resumes/CVs**, **run mock interviews with studio personas**, **get career coaching**, **peek studio intel**, and **ship a slick portfolio**—all with **real-time, multimodal Gemini** smarts.

> **⚠️ Alpha Software**: This is an early development version. Expect bugs, incomplete features, and rapid changes. Use at your own risk!

---

## 🚨 Current Development Status (December 2024)

![Development Status Screenshot](https://github.com/user-attachments/assets/fe2dfe35-f693-463f-a279-2adb8ec59c7e)

**NAVI is currently in heavy development with significant syntax and implementation issues.** The application structure is in place but requires substantial fixes before being fully functional.

### ✅ What's Working
- **Development Environment**: Vite dev server starts successfully
- **Build System**: npm dependencies install and build tools are configured
- **Project Structure**: Vue 3 + TypeScript + Electron architecture is set up
- **Stub Systems**: Browser-compatible stubs for Node.js modules (events, sqlite3)
- **Core Services**: Basic service architecture and API structure exists

### ❌ Critical Issues
- **Syntax Errors**: 100+ TypeScript/JavaScript syntax errors preventing app load
- **Incomplete Functions**: Many service methods contain placeholder logic
- **Missing Implementations**: AI integrations have empty function bodies
- **Type Errors**: TypeScript files with broken type definitions
- **Import Issues**: Some module imports are broken or circular

### 🔧 Recent Fixes Applied
- Fixed broken EventEmitter stub implementation with proper method signatures
- Completed SQLite browser stub with mock database functionality
- Resolved critical syntax errors in font integration utilities
- Fixed missing function declarations in utility services
- Applied automated ESLint fixes to 400+ files (partial success)

### 📋 Known Technical Debt
- **Services Layer**: Most AI services (JobMatching, Interview, Resume) need complete implementations
- **Database Layer**: Real database integration vs. mock stubs needs resolution
- **Type Safety**: Many `any` types and missing TypeScript definitions
- **Error Handling**: Inconsistent error handling patterns across codebase
- **Testing**: No test coverage for current implementations

---

## ⚠️ Known Issues & Limitations (v0.0.1)

### Current Limitations
- **AI Features**: Require Google Gemini API key (not included) 
- **Application State**: Cannot run due to critical syntax errors (see screenshot above)
- **Job Data**: Limited to basic job sources and search capabilities
- **UI Polish**: Interface cannot load due to build errors
- **Performance**: Build performance affected by syntax error scanning
- **Stability**: Development server runs but application cannot initialize

### Missing Features (Coming Soon)
- **Basic Functionality**: App needs to load before features can be implemented
- Advanced job filtering and search options
- Complete portfolio builder with media support
- Mock interview system
- Gamification and achievements
- Advanced AI capabilities (voice/video analysis)

### Development Recommendations
- **Priority 1**: Fix remaining syntax errors to enable basic app loading
- **Priority 2**: Implement core service method bodies with basic functionality
- **Priority 3**: Add proper TypeScript types and error handling
- Use TypeScript strict mode for better type safety
- Add unit tests for service layer implementations
- Implement proper error boundaries for development

---

## 📦 Installation

## 🎯 Features (v0.0.1 Alpha)

> **🚧 Work in Progress**: This alpha release includes core functionality but many features are incomplete or experimental.

### 🎮 Basic Job Search
- **Game Industry Focus**: Search for jobs in gaming studios and companies
- **Basic Filtering**: Filter by location, keywords, and job types
- **Job Details**: View job descriptions and requirements

### � AI Integration (Experimental)
- **Google Gemini API**: Basic AI chat and assistance
- **Resume Analysis**: Simple AI-powered resume feedback
- **Job Matching**: Basic compatibility scoring

### 📄 Document Builder (Basic)
- **Resume Templates**: Simple resume creation tools
- **Cover Letter Builder**: Basic cover letter generation
- **PDF Export**: Generate PDF documents

**ENHANCED**: Configure AI features, manage your profile, and customize the experience with comprehensive settings, advanced AI model selection, and privacy controls.

**New AI Features:**
- 🤖 **AI Model Configuration**: Choose between different AI providers and models
- 📊 **Usage Analytics**: Monitor AI interactions and optimization suggestions
- 🎯 **Context Management**: Control how AI learns from your interactions
- 🔒 **Privacy Controls**: Advanced data management and sharing preferences

> 🎮 **[See the complete feature list with detailed screenshots →](featurelist.md)**

---

## 🚀 Roadmap (v0.0.1 → v0.1.0)

**Current Status**: NAVI v0.0.1 is a functional alpha with basic job search, AI integration, and document building capabilities.

### 🔄 v0.0.2 (Next Release - Bug Fixes & Polish)
- Fix known bugs and crashes
- Improve UI/UX consistency
- Add basic error handling
- Enhance performance and stability

### 🚀 v0.1.0 (Major Feature Release)
- **Enhanced Job Search**: Advanced filters, saved searches, job alerts
- **AI Interview Prep**: Mock interviews with gaming industry scenarios
- **Portfolio Builder**: Complete project showcase with media support
- **Gamification**: XP system, achievements, progress tracking
- **Studio Intelligence**: Company research and culture insights

### 🎯 Future Versions (0.2.0+)
- **Multimodal AI**: Voice/video/screen analysis capabilities
- **Advanced Analytics**: Career insights and success metrics
- **Community Features**: Templates, shared resources
- **Mobile Support**: Cross-platform compatibility
- **Integration APIs**: LinkedIn, GitHub, and other platforms

> **🐛 Help Us Improve**: This alpha release needs your feedback! Report bugs and suggest features to help shape NAVI's future.

---

## 🛠️ Under the Hood (peek)

- **Stack**: Vue 3 + Vite + Electron, Type-safe IPC, secure preload, local storage for keys.
- **AI**: Google **Gemini** (text, audio, and vision) for generation, mapping, and interviews.
- **Multimodal**: Live video & screen-sharing with frame-by-frame AI insights.
- **Privacy**: Local-first; only what you choose is sent to AI; keys never committed.

---

## 📦 Installation

### Prerequisites

- Node.js >= 18 (20 LTS recommended)
- npm 9+ (bundled with Node installs)
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

### Notes

- To use a custom dev port for Electron: `VITE_PORT=5180 npm run electron-dev:port`
- App settings persist locally; API keys are stored on your device and never committed.
- First run may take a minute while dependencies build native modules.

### Troubleshooting

- If Electron can't find the dev server, ensure Vite is running on the same port or use `electron-dev` which starts both.
- Clear caches on odd rebuild issues: `npm run clean` (or `clean:all` to remove `node_modules`).
- Windows PowerShell users may prefer `electron-dev` over `electron-dev:port` due to shell env syntax differences.
- Rebuild native modules for Electron if launch fails: `npm run rebuild:native`

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

### ⚠️ Current Development Status

**The application currently has critical syntax errors that prevent normal development workflow.** See the [Current Development Status](#-current-development-status-december-2024) section above for details.

### Prerequisites

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

# Install dependencies (includes fixing rollup issues)
npm install
npm install @rollup/rollup-linux-x64-gnu --save-dev

# ⚠️ WARNING: The following commands will show syntax errors
# Start development server (will show error overlay)
npm run dev

# Or run Electron app in development (may not load due to errors)
npm run electron-dev

# Run tests (may fail due to import errors)
npm test

# Lint code (will show many syntax errors)
npm run lint

# Format code (will fail on syntax errors)
npm run format
```

### Project Structure

```
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

| Command | Description | Status |
|---------|-------------|--------|
| `npm run dev` | Start Vite development server | ⚠️ Shows error overlay |
| `npm run build` | Build for production | ❌ Fails on syntax errors |
| `npm run electron-dev` | Start Electron in development mode | ⚠️ May not load |
| `npm run electron-build` | Build Electron installers | ❌ Fails on syntax errors |
| `npm test` | Run test suite | ❌ Fails on import errors |
| `npm run lint` | Lint and fix code | ⚠️ Shows many errors |
| `npm run clean` | Clean build artifacts | ✅ Works |

### Architecture

- **Frontend**: Vue 3 + Vite + Vuetify
- **Backend**: Electron + Node.js  
- **Database**: SQLite with better-sqlite3 (currently mocked for browser)
- **AI**: Google Gemini API integration (requires implementation)
- **Security**: Keytar for secure credential storage

### Troubleshooting Development Issues

#### Common Issues

1. **Vite dev server shows error overlay**
   - This is expected due to TypeScript/JavaScript syntax errors
   - Check the browser console for specific file and line numbers
   - Focus on files mentioned in the error messages

2. **Build fails with ESBuild errors**
   - Many source files have incomplete function implementations
   - Look for files with missing closing braces, incomplete type definitions
   - Use TypeScript strict mode to catch more issues early

3. **Import/module resolution errors**
   - Some imports may be circular or point to non-existent modules
   - Check the `tsconfig.json` path mapping for correct aliases
   - Verify all imported modules exist and export the expected symbols

4. **Rollup installation issues**
   - Run: `npm install @rollup/rollup-linux-x64-gnu --save-dev`
   - This fixes the "Cannot find module @rollup/rollup-linux-x64-gnu" error

#### Development Priority Order

1. **Fix Syntax Errors**: Start with files shown in Vite error overlay
2. **Implement Service Methods**: Add basic implementations to empty function bodies  
3. **Fix Type Definitions**: Add proper TypeScript types throughout
4. **Add Error Handling**: Implement consistent error handling patterns
5. **Add Tests**: Create unit tests for core functionality

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🚨 Contributing Priority: Fix Critical Issues

**Before adding new features, please help fix the critical syntax errors that prevent the application from running.**

### Ways to Contribute

- 🔥 **Critical Fixes**: Fix syntax errors, implement empty functions, resolve TypeScript issues
- 🐛 **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- ✨ **Feature Requests**: Open issues with "enhancement" label (after basic functionality works)
- 🛠️ **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Improve docs, add examples, fix typos
- 🎨 **UI/UX**: Design improvements and accessibility enhancements (after app loads)
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

## � Documentation

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

### v0.0.1 - Initial Alpha Release (Current)
- ✅ **Basic Job Search**: Core job searching functionality for gaming industry
- ✅ **AI Integration**: Google Gemini API integration for basic assistance
- ✅ **Document Builder**: Simple resume and cover letter creation
- ✅ **Portfolio Prototype**: Basic project showcase capabilities
- ✅ **User Interface**: Functional Vue.js/Electron application
- ✅ **Local Data Storage**: SQLite database for user data
- ✅ **Settings Management**: Basic configuration and API key setup

### Upcoming Releases
- 🔄 **v0.0.2**: Bug fixes, UI improvements, and stability enhancements
- 🚀 **v0.1.0**: Major feature additions including gamification, advanced AI, and portfolio builder
- 🎯 **v0.2.0+**: Multimodal AI, analytics, and community features

> **📝 Development Notes**: This project is in active early development. Features may change rapidly and some functionality may be incomplete or experimental.

---

## 🧾 License & Credits

- **Dr. Brandon Donnelly (Happy Mask Salesman)** — LinkedIn: [https://www.linkedin.com/in/stracos](https://www.linkedin.com/in/stracos)
- **License**: Navi AI NonCommercial Public License v1.1 (SPDX: LicenseRef-NaviAI-NCPL-1.1). Source-available, noncommercial; not an OSI-approved source-available (noncommercial) license.
- **AI**: Uses your **Google AI Studio** key; real-time conversations powered by Gemini (free tier available).
- **Name**: NAVI CV — because sometimes you really do need a tiny glowing helper yelling "Hey! Listen!"

<p align="center"><em>"You've never been quite so Breath-of-the-Hired."</em></p>

---

## Repository Layout

See [DIRECTORY.md](DIRECTORY.md) for the full repo structure, where scripts/tests/demos live, and how to run them after the reorganization.