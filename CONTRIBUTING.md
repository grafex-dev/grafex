# Contributing to Grafex

Thanks for your interest in contributing to Grafex. Whether it's a bug fix, a new feature, or better docs — we appreciate the help.

## Development Setup

**Requirements:** Node.js >= 20.0.0

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/grafex.git
cd grafex

# Install dependencies (this also downloads WebKit automatically)
npm install

# Build
npm run build

# Run tests
npm test

# Type-check
npm run typecheck
```

If the WebKit download fails during install, run it manually:

```bash
npx playwright install webkit
```

## Project Structure

```
grafex/
├── src/                  # Core library and CLI source
│   ├── index.ts          # Public API exports (render, close, h, Fragment)
│   ├── cli.ts            # CLI entry point
│   ├── commands/         # CLI command implementations
│   │   └── export.ts     # `grafex export` command
│   ├── runtime.ts        # Custom JSX runtime (h, Fragment)
│   ├── transpile.ts      # esbuild bundling of .tsx compositions
│   ├── render.ts         # Rendering pipeline orchestration
│   ├── browser.ts        # WebKit browser lifecycle (Playwright)
│   └── types.ts          # Shared TypeScript types
├── test/
│   ├── unit/             # Unit tests (fast, no browser)
│   ├── integration/      # Integration tests (launches WebKit)
│   └── fixtures/         # .tsx compositions used in tests
├── website/              # Project website (Astro + Tailwind)
├── tsup.config.ts        # Build configuration
├── vitest.config.ts      # Test configuration
└── tsconfig.json         # TypeScript configuration
```

## Architecture Overview

Grafex renders images through a four-stage pipeline:

```
composition.tsx → esbuild (transpile) → JSX runtime (execute) → HTML string → WebKit (screenshot) → PNG
```

1. **Transpile** — esbuild bundles the user's `.tsx` file, injecting Grafex's custom JSX runtime.
2. **Execute** — The bundled code runs in Node.js. The JSX runtime's `h()` function builds a virtual element tree, which is serialized to an HTML string.
3. **Render** — The HTML is loaded into a headless WebKit instance via Playwright.
4. **Capture** — WebKit screenshots the page and returns a PNG buffer.

Key things to know:

- **This is not React.** Grafex has its own JSX runtime (`src/runtime.ts`). No hooks, no state, no virtual DOM. Components are called once to produce HTML.
- **Full CSS support comes for free** from the real browser engine. We don't reimplement layout.
- **Two runtime dependencies:** `esbuild` (transpilation) and `playwright-core` (WebKit rendering). We keep the dependency count minimal on purpose.

## Code Standards

### TypeScript

- Strict mode is enabled. No `any` unless absolutely necessary (and documented why).
- All public API types live in `src/types.ts`.

### Formatting

- [Prettier](https://prettier.io/) handles all formatting. A pre-commit hook runs it automatically via Husky + lint-staged, so you don't need to think about it.
- To check manually: `npm run format:check`

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `style:` — formatting, no logic change
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` — build process, dependencies, tooling

Examples:

```
feat: add SVG output format
fix: handle missing config export gracefully
test: add integration test for --props flag
```

### Tests

- We use [Vitest](https://vitest.dev/) for both unit and integration tests.
- **New features need tests.** Bug fixes should include a test that reproduces the issue.
- Unit tests go in `test/unit/`, integration tests in `test/integration/`.
- Test fixtures (`.tsx` compositions) go in `test/fixtures/`.
- Run the full suite with `npm test`. Run a specific file with `npx vitest run test/unit/runtime.test.ts`.

## Submitting a Pull Request

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Implement** your change. Write tests. Make sure everything passes:
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

3. **Commit** using Conventional Commits. Keep commits focused.

4. **Push** and open a PR against `main`.

5. **CI must pass.** The pipeline runs lint, typecheck, build, and tests. If CI fails, check the logs and fix before requesting review.

### PR guidelines

- **One feature per PR.** Small, focused PRs are easier to review and merge.
- **Include tests** alongside source code changes.
- **Describe what and why** in the PR description. Link to the related issue if there is one.

## What We're Looking For

Check the [GitHub Issues](https://github.com/grafex-dev/grafex/issues) for open tasks. Issues labeled `good first issue` are a great starting point.

For larger changes (new output formats, API redesigns, architectural shifts), **open an issue first** to discuss the approach. This saves everyone time and avoids duplicate work.

## What NOT to Include in PRs

- Internal documentation, strategy files, or private configuration
- Changes unrelated to the PR's stated purpose
- Generated files (`dist/`, `node_modules/`)

## Code of Conduct

Be respectful. We're all here to build something useful. Harassment, discrimination, and bad-faith behavior have no place in this project. See the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) for the full code of conduct we follow.

## Questions?

Open a [GitHub Discussion](https://github.com/grafex-dev/grafex/discussions) or comment on a relevant issue. We're happy to help.
