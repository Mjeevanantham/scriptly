# scriptly

Scriptly Monorepo

Free, open-source, unified AI-powered Integrated Development Environment (IDE) that consolidates fragmented developer workflows into a single, privacy-first platform.

**Run locally (quick):** `pnpm install` → `pnpm run dev:backend` (optional) → `pnpm run dev:extension` → Open `packages/extension` in VS Code and press **F5** to launch the Extension Development Host.

## Project Overview

Scriptly is a monorepo containing:

- **Extension** (`packages/extension`): VS Code Extension (Phase 1 MVP) - TypeScript + VS Code Extension API
- **Website** (`packages/website`): Marketing website (Next.js 14 + Tailwind + Shadcn/UI) - deploy to Vercel
- **Backend** (`packages/backend`): Nest.js API scaffolding (Phase 3 SaaS) - PostgreSQL + AWS infrastructure

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all packages in development mode
pnpm dev
```

## Package Commands

### Extension

```bash
# Development (two options)
# 1) From the repo root (path selector)
pnpm --filter ./packages/extension dev
# 2) From the extension package folder
cd packages/extension && pnpm dev
# Shortcut (added to root package.json)
pnpm run dev:extension

# Build
pnpm --filter ./packages/extension build

# Package for VS Code Marketplace
pnpm --filter ./packages/extension package
```

> NOTE: the extension's `dev` script runs `tsc -w` and remains running ("Watching for file changes"). While the watcher is running, open the extension in VS Code and press **F5** (Run → "Run Extension") to launch an Extension Development Host where the extension is loaded. If you prefer a one-step debug flow, a `.vscode/launch.json` is provided under `packages/extension` that runs a preLaunch build before opening the host.

### Website

```bash
# Development (http://localhost:3000)
pnpm --filter website dev

# Build
pnpm --filter website build

# Production
pnpm --filter website start
```

### Backend

```bash
# Development (http://localhost:3001)
pnpm --filter backend dev

# Build
pnpm --filter backend build

# Production
pnpm --filter backend start:prod
```

## Project Structure

```
scriptly/
├── packages/
│   ├── extension/          # VS Code Extension (Phase 1)
│   │   ├── src/
│   │   │   ├── commands/   # Command handlers
│   │   │   ├── providers/  # VS Code providers
│   │   │   ├── services/   # Core services
│   │   │   ├── webviews/   # Chat panels
│   │   │   └── types/      # TypeScript types
│   │   └── package.json
│   │
│   ├── website/            # Marketing Website (Next.js)
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities
│   │   └── package.json
│   │
│   └── backend/            # Nest.js API (Phase 3 scaffold)
│       ├── src/
│       │   ├── auth/       # Authentication module
│       │   ├── users/      # User management
│       │   ├── teams/      # Team management
│       │   ├── projects/   # Project management
│       │   ├── files/      # File storage
│       │   ├── collaboration/ # Real-time sync
│       │   └── health/     # Health check
│       └── package.json
│
├── Documentation/          # Project documentation
├── turbo.json             # Turborepo configuration
├── pnpm-workspace.yaml    # pnpm workspace config
└── package.json           # Root package.json
```

## Development Workflow

### Monorepo Scripts

- `pnpm dev` - Run all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages
- `pnpm clean` - Clean all build artifacts

### Turborepo

This monorepo uses [Turborepo](https://turbo.build/) for build orchestration and caching. Turborepo:

- Runs tasks in parallel based on dependency graph
- Caches build outputs for faster subsequent builds
- Only runs tasks when dependencies change

## Package Details

### Extension (Phase 1)

VS Code Extension providing:

- AI-powered code completion (Tab feature)
- Interactive chat panel
- Multi-model LLM support (OpenAI, Claude, Ollama)
- Git integration
- File explorer

**Tech Stack:**
- TypeScript
- VS Code Extension API
- LangChain (LLM orchestration)
- React (for webviews)

### Website

Marketing website showcasing Scriptly features.

**Tech Stack:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Vercel Analytics

**Pages:**
- `/` - Landing page
- `/features` - Features overview
- `/why-scriptly` - Comparison with competitors
- `/get-started` - Installation guide
- `/pricing` - Pricing (currently free)
- `/community` - Community links

### Backend (Phase 3 Scaffold)

Nest.js API scaffolding for future SaaS features.

**Tech Stack:**
- Nest.js
- TypeScript
- PostgreSQL (planned)
- AWS S3 (planned)
- Swagger/OpenAPI documentation

**Modules:**
- Health check (`/api/health`)
- Auth (placeholder)
- Users (placeholder)
- Teams (placeholder)
- Projects (placeholder)
- Files (placeholder)
- Collaboration (placeholder)

**API Documentation:**
- Swagger UI: `http://localhost:3001/api/docs`

## CI/CD

### GitHub Actions

- **CI** (`.github/workflows/ci.yml`): Lint, type-check, test, and build on every push/PR
- **Extension Publish** (`.github/workflows/extension-publish.yml`): Publish to VS Code Marketplace on release
- **Website Deploy** (`.github/workflows/website-deploy.yml`): Deploy to Vercel on push to main
- **Backend Build** (`.github/workflows/backend-build.yml`): Build Docker image on push/release

## Environment Variables

### Extension

No environment variables needed. API keys are stored securely via VS Code's secret storage.

### Website

Create `packages/website/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://scriptly.jeevanantham.site
NEXT_PUBLIC_GA_ID=G_XXXXXXXXX  # Optional: Google Analytics
```

### Backend

Create `packages/backend/.env` (see `packages/backend/.env.example`):

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/scriptly
JWT_SECRET=your-secret-key
```

## Separation Strategy

Each package is designed to be independently deployable:

1. **No cross-package imports** - Each package is self-contained
2. **Independent builds** - Each package can build on its own
3. **Clear boundaries** - Packages communicate via APIs/interfaces, not direct imports
4. **Package-level dependencies** - Each `package.json` includes all needed dependencies

### To Separate a Package:

1. Copy the package directory to a new repository
2. Update package name in `package.json`
3. Remove workspace references
4. Install dependencies independently
5. Update CI/CD for standalone deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm type-check`
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Documentation

For detailed documentation, see:

- [BRD](./Documentation/Scriptly_BRD.md) - Business Requirements Document
- [TAD](./Documentation/Scriptly_TAD.md) - Technical Architecture Document
- [DevSpec](./Documentation/Scriptly_DevSpec.md) - Development Specification
- [GTM](./Documentation/Scriptly_GTM.md) - Go-to-Market Strategy

## Roadmap

- **Phase 1** (Current): VS Code Extension MVP
- **Phase 2**: Desktop App (Electron)
- **Phase 3**: SaaS Platform (Web-based IDE + Backend)

## Support

- GitHub: [thejands/scriptly](https://github.com/thejands/scriptly)
- Issues: [GitHub Issues](https://github.com/thejands/scriptly/issues)
- Discord: [Community Discord](https://discord.gg/scriptly)

---

Made with ❤️ by developers, for developers.

