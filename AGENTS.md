# Repository Guidelines

These guidelines help contributors work consistently on the Create Web Kit CLI.

## Project Structure & Module Organization
- `src/` is the TypeScript source root.
- `src/index.ts` is the CLI entry point and orchestration flow.
- `src/config/` defines frameworks, templates, and help text.
- `src/generators/` handles project creation and template augmentation.
- `src/utils/` contains filesystem and package manager helpers.
- `src/templates/` and `src/assets/` store files copied into generated projects.
- `scripts/` includes build helpers such as template copying.
- `dist/` is generated output from `npm run build` and should not be edited by hand.
- `test*.mjs` scripts are lightweight smoke checks.

## Build, Test, and Development Commands
Use `pnpm` (preferred, see `pnpm-lock.yaml`) or `npm`.

```bash
pnpm install
pnpm run dev        # run CLI from src with tsx
pnpm run build      # compile to dist and copy templates
pnpm start          # run compiled CLI from dist
node test.mjs       # basic load/smoke check
```

Release helpers in `makefile`:
`make update-version`, `make push-version`, `make push-tag`, `make publish`.

## Coding Style & Naming Conventions
- TypeScript (ES modules), Node 18+ or 20+ as per `package.json`.
- Indentation: 2 spaces; use double quotes and semicolons.
- Files and folders use kebab-case; functions and variables use camelCase; types use PascalCase.
- Keep CLI flow in `src/index.ts`, and push reusable logic into `src/utils/` or `src/generators/`.

## Testing Guidelines
- No formal test runner is configured.
- Run `node test.mjs` and any relevant `test-*.mjs` scripts after changes.
- When modifying generators or templates, run the CLI and verify a sample project is created correctly.

## Commit & Pull Request Guidelines
- Version bumps follow `bump version to vYY.MMDD.HHMM` (see `make push-version`).
- Keep commits focused and describe intent in the subject line.
- PRs should include a concise description, test steps (commands and results), and screenshots or terminal output when prompts or generated files change.
