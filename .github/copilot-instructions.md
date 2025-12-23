# Copilot / AI Agent Instructions for Scriptly

Quick, actionable guidance to help an AI code agent be immediately productive in this monorepo.

Summary
- Monorepo with three independent packages: `packages/extension` (VS Code extension, primary), `packages/website` (Next.js marketing site), and `packages/backend` (NestJS scaffold).
- Built with pnpm + Turborepo. Use `pnpm` and Node >= 18 (CI uses Node 20).
- Extension implements multi-LLM support using LangChain; API keys are stored in VS Code Secret Storage via `ConfigService`.

What matters most
- Primary feature surface: the VS Code extension (`packages/extension`). Most AI-related logic (LLM management, streaming, prompts, secrets, UI) lives there.
- Key files to read first:
  - `packages/extension/src/services/LLMService.ts` — model creation, caching, streaming, prompt templates
  - `packages/extension/src/services/ConfigService.ts` — how API keys are stored/validated and `scriptly.*` settings
  - `packages/extension/src/utils/Logger.ts` — where logs go and how to view them
  - `packages/extension/src/types/index.ts` — LLM types and config shape
  - `README.md` and `Documentation/*` for product and design rationale

Build / test / dev quick commands
- Full monorepo:
  - Install: `pnpm install`
  - Run all in dev: `pnpm dev`
  - Build all: `pnpm build`
- Per-package (use filter to target package):
  - Extension dev: `pnpm --filter extension dev` (launches `tsc -w` and use VS Code "Run Extension")
  - Website dev: `pnpm --filter website dev` (Next.js)
  - Backend dev: `pnpm --filter backend dev` (NestJS)
  - Tests: `pnpm --filter backend test` or `pnpm --filter extension test`
- CI: `.github/workflows/ci.yml` runs `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` using Node 20 and `pnpm install --frozen-lockfile`.

Project-specific conventions & patterns
- Package separation:
  - Packages are designed to be self-contained; avoid adding cross-package imports unless intentionally coupling modules.
- Settings & secrets:
  - VS Code settings keys: `scriptly.llmProvider`, `scriptly.modelName`, `scriptly.temperature` (see `package.json` contributes.configuration and `ConfigService.getLLMConfig`).
  - API keys stored via `vscode.ExtensionContext.secrets` under `scriptly.apiKey.<provider>` and encrypted by `ConfigService` (use `ConfigService.setApiKey()` to persist keys).
- LLM provider behavior:
  - Supported providers: `openai`, `claude` (Anthropic), `ollama` (local), and `custom` (OpenAI-compatible endpoints).
  - `ollama` defaults to `http://localhost:11434` (local offline LLM). `custom` requires `baseURL` + `apiKey`.
  - When creating models, `LLMService` sets `process.env.OPENAI_API_KEY` as a fallback for libraries that read it.
- Model lifecycle & caching:
  - `LLMService` holds `currentModel` and a `Map`-based cache for completions. After API key or provider changes call `LLMService.invalidateModel()` to force recreation and clear cache.
- Prompt expectations (important when writing prompts or generating code to integrate LLM output):
  - Completion prompt (Tab completion): MUST return only code — NO explanations, NO markdown or fenced blocks. See `buildCompletionPrompt()` in `LLMService.ts`.
  - Chat system prompt: keep answers short (2–4 sentences), prefer bullet points, and focus on structure/patterns. `buildChatPrompt()` enforces this policy for chat responses.
- Streaming:
  - Both chat and completion provide streaming iterators via `streamCompletion()` and `streamChatResponse()` — implement UIs to consume incremental chunks.

Debugging & logs
- Extension logger prints both to an output channel and a log file in the extension global storage dir. Use Command Palette → "Scriptly: Show Log File" or check the `Scriptly` output channel.
- `Logger.initialize()` writes the log path to console during activation so you can find logfile paths easily during debugging.

Common developer tasks & recipes
- Add a new LLM provider:
  1. Add to `LLMProvider` in `packages/extension/src/types/index.ts`.
  2. Implement provider creation in `createModel()` in `LLMService.ts` (and set any required env vars).
  3. Add validation / sample call in `ConfigService.validateApiKey()`.
  4. Add UI options in `package.json` contributes.configuration and update docs/README.
- Changing API keys at runtime:
  - Update via `ConfigService.setApiKey()` which persists in secrets and updates `scriptly.llmProvider` workspace setting. Then call `LLMService.invalidateModel()` to reload the model.
- Running e2e or debugging tests:
  - Backend unit/e2e use Jest (see `packages/backend/package.json` and `test/jest-e2e.json`). Use `pnpm --filter backend test:e2e`.

Security & privacy notes
- API keys are stored locally (secret storage) and encrypted — there is deliberate emphasis on not sending keys to Scriptly servers.
- Docs mention "User code never sent to Scriptly servers" — ensure features that send code clearly document when data is sent to a remote provider.

Where to look when you need context
- High-level docs: `Documentation/` and top-level `README.md` (architecture, roadmap, separation strategy)
- Extension patterns and UX: `packages/extension/README.md` and `src/` (commands/, services/, webviews/)
- LLM integration: `packages/extension/src/services/LLMService.ts` and `ConfigService.ts` (core logic)
- CI and release: `.github/workflows/` (CI uses Node 20 and pnpm), `packages/extension` has `extension-publish.yml`

Example snippets (use when writing or verifying patches)
- Start extension dev: `pnpm --filter extension dev`
- Validate OpenAI key in code:
  - `await configService.validateApiKey('openai')`
- Force model refresh after changing keys:
  - `llmService.invalidateModel()`

If anything here feels incomplete or you want more detail about a specific area (LLM prompts, streaming integration, tests, or publisher workflow), tell me which section and I will iterate. 

-- Scriptly: concise, privacy-first, multi-model LLM support; prefer short, targeted changes and explicit test coverage for provider integration.