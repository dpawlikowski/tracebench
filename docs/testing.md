# Testing pyramid

```
                 ┌─────────────────────┐
                 │  Checkly (optional) │  synthetic monitors
                 │  __checks__/        │
                 └──────────▲──────────┘
                            │
                 ┌──────────┴──────────┐
                 │  Playwright e2e     │  thin critical path
                 │  pnpm test:e2e      │
                 └──────────▲──────────┘
                            │
                 ┌──────────┴──────────┐
                 │  Storybook + Vitest │  stories-as-tests (browser)
                 │  pnpm test:storybook│  MSW + a11y addon
                 └──────────▲──────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │  Contract (MSW + Zod)               │
         │  pnpm test:contracts                │
         └──────────────────▲──────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │  Vitest unit + Stryker mutation     │
         │  pnpm test / pnpm test:mutation     │
         └─────────────────────────────────────┘
```

## GitHub Actions CI

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — **typecheck**, **unit** (`pnpm test`), **contracts** (`pnpm test:contracts`), **boundaries**. Node 22 + pnpm. Demo Mode env defaults. Playwright e2e is **not** in required CI (avoid GHA flakes); run locally with `pnpm test:e2e`.

Badge: https://github.com/dpawlikowski/tracebench/actions/workflows/ci.yml/badge.svg

Demo Mode defaults for all CI-local paths: `AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`.

## Commands

| Script | What |
|--------|------|
| `pnpm test` | Package unit tests (Vitest node) |
| `pnpm test:contracts` | MSW + Zod API contract tests (runs/approve/evals/health) |
| `pnpm test:mutation` | StrykerJS on `packages/domain` + `packages/schemas` (no CI break yet) |
| `pnpm test:storybook` | Stories as browser tests (Playwright Chromium) |
| `pnpm test:e2e` | Thin Playwright journeys against Next |
| `pnpm eval` | Golden release gate CLI |
| `pnpm health` | `curl -i` readiness helper (dev server must be up) |
| `pnpm demo:check` | Asserts Demo Mode (`fixture` + `mock`) healthy |
| `pnpm storybook` | Storybook 10 UI on `:6006` |
| `pnpm build:storybook` | Static Storybook build |
| `pnpm pages:build` | Pages-ready Storybook (`STORYBOOK_BASE_PATH=/tracebench/`) |
| `pnpm checkly:test` | Optional MaC dry-run (needs Checkly login) |

Public Storybook: https://dpawlikowski.github.io/tracebench/ — see `docs/github-pages.md`. Full app is not on Pages.

## Contract tests (Zod + MSW)

**Why not Pact?** Tracebench is a single-repo portfolio MVP with fixture Demo Mode. Zod schemas in `@tracebench/schemas` (`api.ts`) already are the contract. MSW handlers in `apps/web/mocks/handlers.ts` validate request/response with `.parse()` and are shared with Storybook (`setupWorker`) and Vitest (`setupServer`). Adding Pact would buy a broker/CI matrix we do not need yet.

Covered surfaces:

- `GET /api/runs`, `GET /api/runs/:id`
- `POST /api/runs/:id/approve` (body + success + 400)
- `GET /api/evals`, `GET /api/health` (Demo Mode)

```bash
pnpm test:contracts
```

## Mutation testing (Stryker)

- Config: `stryker.config.mjs`
- Mutate globs: `packages/domain/src/**`, `packages/schemas/src/**` (tests/index excluded)
- Runner: `@stryker-mutator/vitest-runner` (Stryker 9.x — Node 20+; Node 22 OK)
- **First-run policy:** `thresholds.break: null` — report score, do not fail CI until the score stabilizes

```bash
pnpm test:mutation                 # full mutate (can take several minutes)
pnpm exec stryker run --dryRunOnly  # smoke: instrument + initial tests only
# HTML report → reports/mutation/mutation.html
```

## Storybook stack (2026)

- **Storybook 10** + `@storybook/nextjs-vite`
- **`@storybook/addon-vitest`** — browser mode = Playwright Chromium
- **MSW 2** + `msw-storybook-addon` — shared handlers
- **`@storybook/addon-a11y`**
- UI kit: Phosphor Instrument tokens

### Gotchas

1. Install Chromium once: `pnpm --filter @tracebench/web exec playwright install chromium`
2. MSW worker: `apps/web/public/mockServiceWorker.js`
3. Contract handlers use `*/api/...` paths so Node fetch to `http://localhost/api/...` matches
4. Keep `test:storybook` / `test:contracts` separate from package `pnpm test` for fast unit CI

## `/api/health` readiness

Returns **503** when a critical check fails.

```bash
pnpm dev
pnpm health
pnpm demo:check
curl -i 'http://127.0.0.1:3000/api/health?force=down'   # → 503
```

## Checkly

See [`__checks__/README.md`](../__checks__/README.md). Account optional; scaffold validates as TypeScript in-repo. Point at Vercel after Stage E deploy.
