# Documentation map

Tracebench docs as of **2026-09-20**. Product default: **Portfolio Demo Mode** (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`) — zero API keys, no multi-tenant/auth.

| Doc | Purpose |
|-----|---------|
| [README.md](../README.md) | Entry: what / why / Demo Mode / how to run / routes |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Hexagonal lite, event-sourced domain, ports, stack |
| [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) | Thesis, roadmap, Stage A–E status |
| [CASE_STUDY_DRAFT.md](./CASE_STUDY_DRAFT.md) · [CASE_STUDY_PUBLISH.md](./CASE_STUDY_PUBLISH.md) | Case study + site publish pack |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | 90s fixtures-only click path |
| [DESIGN_SYSTEM_V2.md](./DESIGN_SYSTEM_V2.md) | Phosphor Instrument tokens & principles |
| [MARKETING_MOTION_V2.md](./MARKETING_MOTION_V2.md) | `/` + `/story` boutique motion (Control Plane Assembly) |
| [testing.md](./testing.md) | Pyramid: unit → contracts → Storybook → e2e → Checkly |
| [help.md](./help.md) | In-app help / tour / `llms.txt` |
| [jev.md](./jev.md) | JevAdapter: HITL gate + eval scorer |
| [cloudflare-agents.md](./cloudflare-agents.md) | Optional `AgentTransport=cloudflare` |
| [ops-telemetry.md](./ops-telemetry.md) | OpsTelemetry port + Ops Trace UI |
| [github-pages.md](./github-pages.md) | Storybook on GitHub Pages (not the full app) |
| [perf-a11y-budget.md](./perf-a11y-budget.md) | Lighthouse / a11y actuals (2026-09-20 re-measure) |
| [perf-ux-audit.md](./perf-ux-audit.md) | Perf/UX fixes + residual risk |
| [ux-audit.md](./ux-audit.md) | UX polish changelog (toasts, kbd, skeletons) |
| [adr/0001–0004](./adr/) | Events, Jev, nested runs, OpsTelemetry |
| [apps/agent-worker/README.md](../apps/agent-worker/README.md) | DO scaffold: persist / HITL / SSE (not LLM loops) |
| [__checks__/README.md](../__checks__/README.md) | Optional Checkly MaC scaffold |
| [apps/web/public/llms.txt](../apps/web/public/llms.txt) | Machine-readable product summary |
| [apps/web/.env.example](../apps/web/.env.example) | Demo Mode defaults + opt-in live env |

## Public URLs

| Surface | URL |
|---------|-----|
| GitHub (code on `main`) | https://github.com/dpawlikowski/tracebench |
| GitHub Pages (Storybook only) | https://dpawlikowski.github.io/tracebench/ |
| Full Demo Mode app | https://tracebench.vercel.app (Demo Mode) · local `pnpm dev` |

## Honesty (portfolio)

- Worker = scaffold (persist / HITL / SSE) — **no** LLM agent loops yet
- Pages = Storybook only — full app needs Node (local or Vercel)
- Lighthouse numbers only as recorded in `perf-a11y-budget.md`
