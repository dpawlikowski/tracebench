# Tracebench — Product & Architecture Plan

**Role lens:** Product Owner (outcomes) · Architect (boundaries) · Product Engineer (shippable slices)  
**Date:** 2026-09-20 · **Product:** Agent Ops Workbench (HITL control plane)  
**Not:** ChatGPT clone · LangGraph IDE · observability SaaS clone  
**Docs map:** [INDEX.md](./INDEX.md)

---

## 1. Product thesis (one sentence)

Tracebench is the **control plane for irreversible agent work**: see the event log, gate risk with Jev + humans, prove quality with evals, supervise **nested multi-agent** runs (observe graph), and inspect **Ops Trace** spans — without becoming a workflow studio.

**Who it's for (interview persona):** Senior FE / AI platform hire — Dominik Pawlikowski — proving architecture judgment, realtime UX, design-system craft, and AI product sense.

**90-second recruiter path:** Landing → Runs → Replay + Approve → Evals → Graph / nested agents → Ops → Help tour / FAQ.

**Default:** Portfolio Demo Mode — `AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`. Zero API keys. No multi-tenant/auth.

---

## 2. North-star principles

1. **Event log is truth** — UI is a projection (`reduce`); approvals/Jev are commands.
2. **HITL is the product surface** — not a checkbox after chat.
3. **Zero-key demo default** — fixtures + mock Jev + fixture OpsTelemetry; live/CF optional behind ports.
4. **Quiet chrome, dense ops** — Phosphor Instrument (near-black + `#B8FF3D`); boutique marketing only on `/` and `/story`.
5. **Ship judgment artifacts** — ADRs, eval gate, health, stories-as-tests, Lighthouse actuals.
6. **Prefer observe over author** — graph/pipelines read-only / template-run; full visual IDE out of scope for portfolio v1.
7. **UI observes** — real multi-LLM orchestration would live in `apps/agent-worker` (not implemented yet).

---

## 3. Current capability map (shipped)

| Area | Status | Notes |
|------|--------|--------|
| Monorepo + packages | ✅ | domain, schemas, fixtures, evals, ui, agent-runtime, web, agent-worker |
| Seeded runs + SSE v1 | ✅ | Replay timeline |
| HITL approvals + XState | ✅ | Critical Playwright path |
| Jev gate + eval scorer | ✅ | Mock default; live optional |
| Nested agents + observe graph | ✅ | M1/M2 — `useChildRuns` dumb UI |
| CF Agents worker | ✅ | Env-switchable; **scaffold** persist/HITL/SSE — not LLM loops |
| OpsTelemetry + `/ops` | ✅ | Fixture GenAI-shaped spans; ADR 0004 |
| Phosphor Instrument DS | ✅ | See `DESIGN_SYSTEM_V2.md` |
| Marketing `/` + `/story` | ✅ | Control Plane Assembly; `MARKETING_MOTION_V2.md` |
| Dashboards + A2A logs | ✅ | Stage C |
| Testing / health / help / FAQ | ✅ | Storybook, MSW contracts, Joyride, `/help/faq` |
| GitHub + Pages Storybook | ✅ | https://github.com/dpawlikowski/tracebench · Pages UI kit only |
| Vercel prod deploy | ⬜ | **Stage E — still pending** |

---

## 4. Multi-agent & pipelines — product decision

### Do (aligned with thesis)

| ID | Feature | Status |
|----|---------|--------|
| **M1** | Nested agent runs + A2A in Logs | ✅ |
| **M1** | Child drill-in (same Run Detail) | ✅ |
| **M2** | `/runs/[id]/graph` Aggregated \| Expanded | ✅ |
| **M3** | `/pipelines` template gallery | ⬜ Parked (optional CV spike) |
| **M4** | CF sub-agent / Workflow adapter | ⬜ Later (after Vercel) |

### Don't (anti-goals)

- Full drag-drop orchestration IDE
- Compile to LangGraph / CrewAI / Mastra
- Kafka / Redis agent mesh
- Realtime collab cursors on canvas
- Replacing HITL/evals with “more agents”
- Three.js on marketing critical path
- Multi-tenant auth on demo path

---

## 5. Domain model (shipped extensions)

```
AgentRef { id, name, role, modelHint? }

Domain events (additive):
  AgentSpawned | AgentMessage | AgentAwait | AgentJoined

Run gains:
  parentRunId?: string
  childRunIds?: string[]
  agents?: AgentRef[]
```

**Invariant:** child runs are first-class `AgentRun`s; parent fold stays pure; UI never invents edges not in events.

**Ports:** `AgentTransport`, `JevAdapter`, `OpsTelemetry` — fixtures implement today.

---

## 6. Library stack (locked)

### Keep

| Concern | Lib |
|---------|-----|
| App | Next.js App Router, React 19, TS strict |
| Server state | TanStack Query + nuqs |
| HITL flow | XState v5 |
| UI | Tailwind v4 + Phosphor Instrument `@tracebench/ui` |
| Motion | `motion` + CSS 3D (marketing); Canvas lattice optional |
| Streaming charts | uPlot |
| Decision layer | Jev (mock/live) |
| Ops spans | OpsTelemetry (fixture default) |
| Runtime option | Cloudflare Agents (DO) scaffold |
| Graph | `@xyflow/react` observe-only |
| E2E / unit | Playwright · Vitest · Storybook 10 + MSW |

### Avoid

Intro.js, Shepherd commercial friction, R3F/Three.js in product or marketing critical path, ECharts for our volume, Redux, Cypress, Kafka/Redis for demo.

---

## 7. Stage status (locked sequencing)

```
A ✅ → B ✅ → M1/M2 ✅ → Stage C ✅ → Stage D ✅ → Stage E 🔄 (partial)
```

### Stages A–D — Done

Architecture hardening, platform FE, nested agents + graph, dashboards/A2A, evidence pack, Lighthouse actuals, demo GIF, help/FAQ, Phosphor + marketing v2, OpsTelemetry.

### Stage D — Demo Mode contract (zero external agents)

**Hard requirement:** Recruiter runs `pnpm install && pnpm dev` and clicks every primary surface with **no** Cloudflare, **no** Jev/AI Gateway key, **no** live LLM.

| Surface | Demo source |
|---------|-------------|
| Runs / Replay / SSE | `AGENT_TRANSPORT=fixture` |
| HITL approve/deny | In-memory + fixture pending approvals |
| Jev gate + evals | `JEV_ADAPTER=mock` / `EVAL_SCORER=mock-jev` |
| Ops Trace | `OPS_TELEMETRY=fixture` |
| Multi-agent / graph / logs | Seeded parent+children + AgentMessage events |
| Dashboards | Widgets from fixture aggregates; layout localStorage |
| Help / tour / FAQ | Static + Joyride; skip auto-tour under Playwright |
| Health | Reports `fixture` + `mock` — **200** when demo-healthy |

**Env defaults** (README + `.env.example`):

```
AGENT_TRANSPORT=fixture
JEV_ADAPTER=mock
EVAL_SCORER=mock-jev
OPS_TELEMETRY=fixture
```

**Demo script:** `docs/DEMO_SCRIPT.md` · **Smoke:** `pnpm demo:check`

### Stage E — Ship (public) — in progress

| Slice | Deliverable | Status |
|-------|-------------|--------|
| **E1 — GitHub** | `dpawlikowski/tracebench` on `main` | ✅ |
| **E1b — Pages** | Storybook only at `dpawlikowski.github.io/tracebench/` | ✅ |
| **E2 — Deploy** | Vercel app (fixture default) | ⬜ **Still pending** |
| **E3 — Synthetics** | Checkly against prod | ⬜ After E2 |
| **E4 — Case study** | dpawlikowski.pl page | ⬜ Draft in `CASE_STUDY_DRAFT.md` |
| **E5 — CI badges** | test · eval · e2e · lighthouse · health | ⬜ Open |

**Stage E anti-goals:** Blocking on M4 CF sub-agents, multi-tenant, real LLM spend for demo.

---

## 8. Success metrics (portfolio ready)

- [x] Recruiter path &lt; 90s without narration (Demo Mode)
- [x] `pnpm test && pnpm eval && pnpm test:e2e && pnpm build` green (local evidence)
- [x] Health endpoint honest (503 on fail)
- [x] Multi-agent fixture + graph view
- [x] Help tour + `/help` + FAQ
- [x] ADR set: events, Jev, multi-agent, OpsTelemetry
- [x] README + ARCHITECTURE + PRODUCT_PLAN consistent (this refresh)
- [x] GitHub + Pages Storybook
- [ ] Vercel public Demo Mode URL
- [ ] Site case study both ways + CI badges

---

## 9. Interview talk-tracks

1. “Chat is secondary; the product is the **control plane for irreversible tools**.”
2. “Runs are **event-sourced**; multi-agent is nested runs + messages, not a second database.”
3. “Jev answers **calibrated questions**; policy stays in code.”
4. “Graph and Ops Trace are **observe-first** — UI does not orchestrate LLMs.”
5. “Fixtures and Cloudflare share **AgentTransport** — same UI.”
6. “Phosphor Instrument + boutique `/` `/story` — ops density, marketing craft.”

---

## 10. Explicit non-roadmap (say no)

Building a general multi-agent OS, competing with Langfuse cloud, or shipping agent mesh infra. Tracebench wins by being a **sharp Senior FE showpiece**, not a platform company.
