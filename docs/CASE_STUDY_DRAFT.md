# Tracebench — case study draft (dpawlikowski.pl)

> Paste-ready draft. Tone: senior FE / agent-ops product craft. Demo Mode only — no keys.  
> As of **2026-09-20**.

## Problem

Teams shipping tool-calling agents (payments, deploys, remittances) need a **HITL control room**, not another chat UI. Operators must see what the agent is about to do, gate irreversible tools by risk, keep an immutable audit trail, and ship behind an eval gate — without depending on live LLM spend for a portfolio demo.

## Constraints

- **Zero external agents** by default (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`)
- Fixtures-only Demo Mode: recruiter runs `pnpm install && pnpm dev` and clicks through
- No multi-tenant/auth on the demo path
- Strict monorepo boundaries (schemas → domain → fixtures/evals → web)
- Portfolio timeline: ship judgment (evals, a11y, evidence) before platform sprawl

## Approach

1. **Event-sourced runs** — timeline of thoughts / tools / approvals / A2A; UI never invents edges
2. **Risk-tiered approvals** — high-risk tools pause; keyboard modal (Esc / ⌘Enter); audit appends human decision
3. **Eval release gate** — golden set (~40) scored by mock-jev; intentional `expect-fail` cost regressions
4. **Observe graph + Ops Trace** — dumb presentational React Flow; OpsTelemetry projects OTel GenAI–shaped fixture spans; `useChildRuns` / `useRunsDetails` unwrap TanStack Query (UI does not unwrap Query)
5. **Phosphor Instrument + boutique marketing** — near-black + `#B8FF3D`; `/` + `/story` Control Plane Assembly (CSS 3D, no Three.js)
6. **Contract layer** — Zod schemas + MSW handlers shared by Storybook and Vitest (no Pact broker)
7. **Mutation testing** — Stryker on domain + schemas (report-only threshold for first ship)

## Architecture (one-liner)

```
packages/schemas (Zod) → packages/domain (reduce/decide)
                       → packages/fixtures + evals
packages/agent-runtime   AgentTransport | JevAdapter | OpsTelemetry
apps/web (Next App Router) ← MSW / TanStack Query / XState replay
apps/agent-worker          DO scaffold (persist/HITL/SSE — not LLM loops yet)
```

Optional: Cloudflare Agents behind `AGENT_TRANSPORT=cloudflare`. UI observes; multi-LLM orchestration would live in the worker later.

## Demo path (≈90s)

1. Landing → Demo Mode badge  
2. `/runs/run_live_approve` → Replay → Review high-risk payment → Approve  
3. `/runs/run_pipeline_ops` → children → Logs `a2a` → Graph  
4. `/ops` → fixture span summaries  
5. `/evals` → gate PASS with 2 intentional fails  
6. `/dashboards` → fixture KPIs  
7. `/story` → boutique narrative (optional)

Artifact: `docs/screenshots/demo-mode.gif` (also `apps/web/public/demo-mode.gif`).

## Results (local, Demo Mode)

| Signal | Result |
|--------|--------|
| Eval gate | ✅ PASS — 40 cases, 38 pass / 2 intentional fail (95%) |
| E2E | Playwright critical path (HITL + graph smoke) |
| Storybook | Vitest browser stories + a11y addon; also on GitHub Pages |
| Contracts | `pnpm test:contracts` — runs / approve / evals / health |
| Health / demo:check | HTTP 200, `demoMode.kind=demo`, transport=fixture |
| Lighthouse (mobile) | See `docs/perf-a11y-budget.md` actuals (do not invent new scores) |
| Mutation | Stryker report-only (`thresholds.break: null`) |

## Public presence

| Surface | Status |
|---------|--------|
| GitHub `main` | https://github.com/dpawlikowski/tracebench |
| Storybook (Pages) | https://dpawlikowski.github.io/tracebench/ |
| Full app on Vercel | https://tracebench.vercel.app |
| This case study on dpawlikowski.pl | Draft — link both ways when live |

## Limitations

- In-memory approval store (demo); worker DO SQLite is opt-in
- No OAuth / multiplayer / live LLM on the happy path
- Worker is scaffold for persist/HITL/SSE — not LLM agent loops yet
- Mutation break threshold deferred until score baseline exists

## Next (Stage E remainder)

Site case study both ways on dpawlikowski.pl · CI badges · Checkly against https://tracebench.vercel.app.

---

*Dominik Pawlikowski — Tracebench portfolio MVP*

Docs map: [INDEX.md](./INDEX.md)
