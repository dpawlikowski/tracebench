# Tracebench

**Agent Ops Workbench** — a HITL control room for AI agents.  
Senior FE portfolio showpiece for **Dominik Pawlikowski**.

[![CI](https://github.com/dpawlikowski/tracebench/actions/workflows/ci.yml/badge.svg)](https://github.com/dpawlikowski/tracebench/actions/workflows/ci.yml)
[![GitHub Pages (Storybook)](https://github.com/dpawlikowski/tracebench/actions/workflows/github-pages.yml/badge.svg)](https://github.com/dpawlikowski/tracebench/actions/workflows/github-pages.yml)

![Demo Mode walkthrough](./docs/screenshots/demo-mode.gif)

> **Portfolio Demo Mode (default):** `AGENT_TRANSPORT=fixture` · `JEV_ADAPTER=mock` · `EVAL_SCORER=mock-jev` · `OPS_TELEMETRY=fixture`  
> No API keys. No Cloudflare. No live LLMs. No multi-tenant/auth. `pnpm install && pnpm dev` → click through.

**What / why:** Not a ChatGPT wrapper. Chat is secondary. The product is a calm control plane for irreversible tools — streaming timeline, risk-tiered approvals, audit log, cost/latency, eval release gate, and Ops Trace (fixture GenAI-shaped spans). UI observes; orchestration stays on ports.

**UI:** Phosphor Instrument (near-black + `#B8FF3D`, Geist, hairlines, radius 2–6) — [DESIGN_SYSTEM_V2](./docs/DESIGN_SYSTEM_V2.md).  
**Marketing:** `/` + `/story` Control Plane Assembly (CSS 3D, no Three.js) — [MARKETING_MOTION_V2](./docs/MARKETING_MOTION_V2.md).

| Link | URL |
|------|-----|
| Docs map | [docs/INDEX.md](./docs/INDEX.md) |
| GitHub (`main`) | https://github.com/dpawlikowski/tracebench |
| Storybook (Pages only) | https://dpawlikowski.github.io/tracebench/ |
| Full Demo Mode app | https://tracebench.vercel.app |

---

## How to run

Requires **Node ≥ 20** and **pnpm 9**.

```bash
cd /workspace/tracebench
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm eval              # golden release gate (exit 1 on fail)
pnpm test              # Vitest unit (schemas / domain / evals)
pnpm test:contracts    # MSW + Zod API contracts
pnpm test:storybook    # Storybook stories-as-tests
pnpm test:e2e          # Playwright critical path
pnpm test:mutation     # Stryker (domain + schemas; no break threshold yet)
pnpm storybook         # :6006
pnpm build:storybook   # static Storybook → apps/web/storybook-static
pnpm pages:build       # Pages-ready Storybook (STORYBOOK_BASE_PATH=/tracebench/)
pnpm pages:preview     # preview that folder locally
pnpm health            # curl /api/health (dev must be up)
pnpm demo:check        # Demo Mode healthy
pnpm build
pnpm check:boundaries
```

Optional live paths (not required): see `apps/web/.env.example`.

---

## Documentation map

Full index: **[docs/INDEX.md](./docs/INDEX.md)**.

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Hexagonal lite, event-sourced domain, ports |
| [docs/PRODUCT_PLAN.md](./docs/PRODUCT_PLAN.md) | Thesis + Stage A–E status |
| [docs/CASE_STUDY_DRAFT.md](./docs/CASE_STUDY_DRAFT.md) · [CASE_STUDY_PUBLISH.md](./docs/CASE_STUDY_PUBLISH.md) | Site case study + publish pack |
| [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) | 90s fixtures click path |
| [docs/DESIGN_SYSTEM_V2.md](./docs/DESIGN_SYSTEM_V2.md) | Phosphor Instrument tokens |
| [docs/MARKETING_MOTION_V2.md](./docs/MARKETING_MOTION_V2.md) | `/` + `/story` boutique motion |
| [docs/testing.md](./docs/testing.md) | Test pyramid |
| [docs/jev.md](./docs/jev.md) · [ops-telemetry.md](./docs/ops-telemetry.md) · [cloudflare-agents.md](./docs/cloudflare-agents.md) | Ports |
| [docs/github-pages.md](./docs/github-pages.md) | Storybook on Pages (not the full app) |
| [docs/help.md](./docs/help.md) · [perf-a11y-budget.md](./docs/perf-a11y-budget.md) | Help / Lighthouse actuals |
| [docs/adr/](./docs/adr/) | ADRs 0001–0004 |
| [apps/agent-worker/README.md](./apps/agent-worker/README.md) | DO scaffold (not LLM loops) |
| [__checks__/README.md](./__checks__/README.md) | Optional Checkly MaC |

---

## Problem → approach → results

### Problem

Supervising tool-calling agents in fintech/ops needs a calm control surface: see what the agent is about to do, gate high-risk actions, keep an immutable trail, and ship behind eval gates — without another chat UI.

### Approach

- Event-sourced runs + risk-tiered HITL (domain commands → events → `reduce`)
- Fixture Demo Mode as the product default; live transports are opt-in
- Hexagonal lite: `AgentTransport` (fixture \| cloudflare), `JevAdapter`, `OpsTelemetry`
- Dumb graph/child UI: `useChildRuns` / `useRunsDetails` unwrap TanStack Query; views take `AgentRun[]`
- Contract layer = **Zod + MSW** (shared Storybook/Vitest handlers) — not Pact
- Mutation testing (Stryker) on domain + schemas — report-only first ship

### Results (local evidence, Demo Mode)

| Check | Command | Result |
|-------|---------|--------|
| **Eval gate** | `pnpm eval` | ✅ PASS — 40 cases, 38 pass / **2 intentional fail** (95%), mock-jev |
| **E2E** | `pnpm test:e2e` | Playwright critical path (HITL approve + graph smoke) |
| **Storybook** | `pnpm test:storybook` | 11/11 Vitest browser stories |
| **Contracts** | `pnpm test:contracts` | runs / approve / evals / health (MSW + Zod) |
| **Health** | `pnpm health` | HTTP **200**, `demoMode.kind=demo`, transport=`fixture` |
| **Demo smoke** | `pnpm demo:check` | OK — zero external agents |
| **Lighthouse mobile** | [docs/perf-a11y-budget.md](./docs/perf-a11y-budget.md) | `/` 88/98/96 · `/runs` 88/98/96 · detail 77/95/96 · `/story` 82/98/96 |
| **Mutation** | `pnpm test:mutation` | Stryker 9 — `thresholds.break: null` (first-run) |

Walkthrough: [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) · Case study: [docs/CASE_STUDY_DRAFT.md](./docs/CASE_STUDY_DRAFT.md) · Publish pack: [docs/CASE_STUDY_PUBLISH.md](./docs/CASE_STUDY_PUBLISH.md)

---

## Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)**, ADRs under `docs/adr/`, and [docs/testing.md](./docs/testing.md).

```
apps/web              Next.js App Router + SSE replay (composition root)
packages/domain       Pure TS: events, reduce, decideApproval
packages/agent-runtime  AgentTransport · Jev · OpsTelemetry (fixture | cloudflare)
apps/agent-worker     Cloudflare Agents DO scaffold (persist / HITL / SSE — not LLM loops yet)
packages/ui           Phosphor Instrument tokens + primitives
packages/schemas      Zod: Run, ToolCall, Approval, Eval, StreamFrame, API envelopes
packages/fixtures     Tool catalog + seeded runs
packages/evals        ~40 golden cases, mock-jev scorer + rules escape
```

UI **observes**. Real multi-LLM orchestration would live in `apps/agent-worker` (not implemented yet).

### OpsAgent tool risks

| Risk   | Tools                             |
|--------|-----------------------------------|
| low    | `search_docs`, `list_accounts`    |
| medium | `draft_email`, `write_file`       |
| high   | `execute_payment`, `deploy_config`|

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing (Control Plane Assembly) + Demo Mode CTA |
| `/story` | Boutique scroll narrative |
| `/runs` | Run list (nuqs filters) |
| `/runs/[id]` | Replay, approval modal, metrics, audit, children, Ops Trace |
| `/runs/[id]/graph` | Observe graph (dumb view + `useChildRuns`) |
| `/evals` | Release-gate scorecard |
| `/policy` | Jev risk matrix (mock) |
| `/dashboards` | Ops boards (fixture projections) |
| `/ops` | Ops Trace fleet (fixture span summaries) |
| `/help/*` | Docs, FAQ (`/help/faq`), failure gallery, tour |
| `/architecture` | Architecture story |

API: `GET /api/runs`, `GET /api/runs/[id]`, `GET /api/runs/[id]/stream`, `POST /api/runs/[id]/approve`, `GET /api/evals`, `GET /api/health`, `GET /api/ops/runs`, `GET /api/ops/runs/[id]`, `GET|POST /api/policy/evaluate`.

---

## Interview talk-track (2 min)

1. **Problem** — irreversible tools need HITL, not chat.
2. **Hero** — `/runs/run_live_approve` → Replay → Review → Approve (⌘Enter).
3. **Safety** — audit appends human decision; status → succeeded.
4. **Multi-agent** — pipeline run → children → A2A logs → graph.
5. **Ops** — `/ops` + run-detail Ops Trace (fixture GenAI-shaped spans).
6. **Quality** — `/evals` + `pnpm eval`; intentional cost regressions tagged expect-fail.
7. **Craft** — monorepo boundaries, Zod contracts, dumb UI over Query hooks, Phosphor Instrument.

---

## Limitations / next

- No real LLMs, OAuth, multiplayer, or microservices on the demo path
- Approval store is in-memory (fixture); worker DO SQLite is opt-in
- Mutation break threshold deferred until a baseline score exists
- Worker: DO persist / HITL / SSE scaffold — **not** LLM agent loops yet
- **Stage E (partial):** GitHub + Pages Storybook + **Vercel Demo Mode live** (https://tracebench.vercel.app) + CI badges + case-study publish pack; site paste on dpawlikowski.pl still open; Checkly deploy optional

---

## Author

Dominik Pawlikowski — portfolio MVP, Demo Mode by default.
