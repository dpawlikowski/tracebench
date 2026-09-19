# Tracebench — case study draft (dpawlikowski.pl)

> Paste-ready draft. Tone: senior FE / agent-ops product craft. Demo Mode only — no keys.

## Problem

Teams shipping tool-calling agents (payments, deploys, remittances) need a **HITL control room**, not another chat UI. Operators must see what the agent is about to do, gate irreversible tools by risk, keep an immutable audit trail, and ship behind an eval gate — without depending on live LLM spend for a portfolio demo.

## Constraints

- **Zero external agents** by default (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`)
- Fixtures-only Demo Mode: recruiter runs `pnpm install && pnpm dev` and clicks through
- Strict monorepo boundaries (schemas → domain → fixtures/evals → web)
- Portfolio timeline: ship judgment (evals, a11y, evidence) before platform sprawl

## Approach

1. **Event-sourced runs** — timeline of thoughts / tools / approvals / A2A; UI never invents edges
2. **Risk-tiered approvals** — high-risk tools pause; keyboard modal (Esc / ⌘Enter); audit appends human decision
3. **Eval release gate** — golden set (~40) scored by mock-jev; intentional `expect-fail` cost regressions
4. **Observe graph** — dumb presentational React Flow; `useChildRuns` / `useRunsDetails` unwrap TanStack Query with stable fingerprints (no max-update-depth)
5. **Contract layer** — Zod schemas + MSW handlers shared by Storybook and Vitest (no Pact broker)
6. **Mutation testing** — Stryker on domain + schemas (report-only threshold for first ship)

## Architecture (one-liner)

```
packages/schemas (Zod) → packages/domain (reduce/decide)
                       → packages/fixtures + evals
apps/web (Next App Router) ← MSW / TanStack Query / XState replay
```

Optional: Cloudflare Agents worker behind `AGENT_TRANSPORT=cloudflare`.

## Demo path (≈90s)

1. Landing → Demo Mode badge  
2. `/runs/run_live_approve` → Replay → Review high-risk payment → Approve  
3. `/runs/run_pipeline_ops` → children → Logs `a2a` → Graph  
4. `/evals` → gate PASS with 2 intentional fails  
5. `/dashboards` → fixture KPIs  

Artifact: `docs/screenshots/demo-mode.gif` (also `apps/web/public/demo-mode.gif`).

## Results (local, Demo Mode)

| Signal | Result |
|--------|--------|
| Eval gate | ✅ PASS — 40 cases, 38 pass / 2 intentional fail (95%) |
| E2E | Playwright critical path (HITL + graph smoke) |
| Storybook | Vitest browser stories + a11y addon |
| Contracts | `pnpm test:contracts` — runs / approve / evals / health |
| Health / demo:check | HTTP 200, `demoMode.kind=demo`, transport=fixture |
| Lighthouse (mobile) | See `docs/perf-a11y-budget.md` actuals |
| Mutation | Stryker report-only (`thresholds.break: null`) |

## Limitations

- In-memory approval store (demo)
- No OAuth / multiplayer / live LLM on the happy path
- Mutation break threshold deferred until score baseline exists

## Next (Stage E — not this draft)

Public GitHub + Vercel URL + site case study link both ways + CI badges.

---

*Dominik Pawlikowski — Tracebench portfolio MVP*
