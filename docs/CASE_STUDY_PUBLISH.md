# Tracebench — publish pack for dpawlikowski.pl

Paste-ready fields for the site. Full narrative: [CASE_STUDY_DRAFT.md](./CASE_STUDY_DRAFT.md).

**As of:** 2026-09-20 (CEST)

---

## Title

**Tracebench** — Agent Ops Workbench

## One-liner

A HITL control room for tool-calling agents: event timeline, risk-tiered approvals, audit trail, and an eval release gate — Demo Mode on fixtures, zero API keys.

## Short PL blurb

Control plane dla agentów AI: timeline, zatwierdzenia HITL, audit i bramka ewaluacyjna. Demo Mode bez kluczy. Live na [tracebench.vercel.app](https://tracebench.vercel.app); Storybook na Pages; kod na GitHubie.

## Problem

Supervising irreversible agent tools (payments, deploys) needs a calm control surface — not another chat UI. Operators must see intent, gate high-risk actions, keep an immutable trail, and ship behind eval gates.

## Approach

- Event-sourced runs + risk-tiered HITL (domain commands → events → `reduce`)
- Fixture Demo Mode as the product default; live transports opt-in via ports
- Hexagonal lite: `AgentTransport`, `JevAdapter`, `OpsTelemetry`
- Zod + MSW contracts shared by Storybook and Vitest; Stryker on domain/schemas
- Phosphor Instrument UI; boutique `/` + `/story` (CSS 3D, no Three.js)

## Results (evidence, Demo Mode)

| Signal | Result |
|--------|--------|
| Eval gate | 40 cases · 38 pass / 2 intentional fail (95%) |
| Contracts / unit / typecheck | CI on `main` (`.github/workflows/ci.yml`) |
| E2E | Playwright HITL + graph smoke (local) |
| Lighthouse mobile | `/` **88**/98/96 · `/runs` **88**/98/96 · detail **77**/95/96 · `/story` **82**/98/96 |
| Health | `demoMode.kind=demo`, transport=`fixture` |

Details: [perf-a11y-budget.md](./perf-a11y-budget.md) · [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

## Stack

Next.js 15 · React 19 · TypeScript · TanStack Query · XState · React Flow · Zod · MSW · Vitest · Playwright · Storybook 10 · pnpm monorepo · Vercel · (optional) Cloudflare Agents worker scaffold · Checkly MaC ready

## Links

| Surface | URL |
|---------|-----|
| Live Demo Mode app | https://tracebench.vercel.app |
| GitHub | https://github.com/dpawlikowski/tracebench |
| Storybook (GitHub Pages) | https://dpawlikowski.github.io/tracebench/ |
| Local alternate | `pnpm install && pnpm dev` → http://localhost:3000 |
| CI | https://github.com/dpawlikowski/tracebench/actions/workflows/ci.yml |

## Screenshots (from `docs/screenshots/`)

| File | Use on site |
|------|-------------|
| `01-landing.png` | Hero / marketing Control Plane Assembly |
| `02-runs.png` | Runs list |
| `03-run-detail.png` | Replay + timeline |
| `04-approval-modal.png` | High-risk HITL modal |
| `05-evals.png` | Eval release gate |
| `06-dashboards.png` | Ops dashboards |
| `07-pipeline-a2a.png` | Nested / A2A pipeline |
| `08-graph.png` | Observe graph |
| `09-demo-mode.png` | Demo Mode badge / landing alt |
| `demo-mode.gif` | Primary motion walkthrough (also `apps/web/public/demo-mode.gif`) |
| `demo-mode.mp4` | Optional longer capture |

## Honesty footnotes (keep visible)

- Pages hosts **Storybook only** — full Demo Mode app is on Vercel (and local).
- Worker = persist / HITL / SSE scaffold — **not** LLM agent loops yet.
- Checkly: set `ENVIRONMENT_URL=https://tracebench.vercel.app` (do not point checks at Pages).

---

*Dominik Pawlikowski*
