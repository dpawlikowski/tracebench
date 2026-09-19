# Tracebench — Product & Architecture Plan

**Role lens:** Product Owner (outcomes) · Architect (boundaries) · Product Engineer (shippable slices)  
**Date:** 2026-09-19 · **Product:** Agent Ops Workbench (HITL control plane)  
**Not:** ChatGPT clone · LangGraph IDE · observability SaaS clone

---

## 1. Product thesis (one sentence)

Tracebench is the **control plane for irreversible agent work**: see the event log, gate risk with Jev + humans, prove quality with evals, and (next) supervise **multi-agent pipelines** without becoming a workflow studio.

**Who it's for (interview persona):** Senior FE / AI platform hire — Dominik Pawlikowski — proving architecture judgment, realtime UX, design-system craft, and AI product sense in one live URL.

**90-second recruiter path:** Landing → Runs → Replay + Approve → Evals → (soon) Graph / nested agents → Help tour.

---

## 2. North-star principles

1. **Event log is truth** — UI is a projection (`reduce`); approvals/Jev are commands.
2. **HITL is the product surface** — not a checkbox after chat.
3. **Zero-key demo default** — fixtures + mock Jev; live/CF optional behind ports.
4. **Quiet chrome, dense ops** — Linear / Better Stack / Langfuse vibe.
5. **Ship judgment artifacts** — ADRs, eval gate, health, stories-as-tests.
6. **Prefer observe over author** — graph/pipelines start read-only / template-run; full visual IDE is out of scope for portfolio v1.

---

## 3. Current capability map (shipped)

| Area | Status | Notes |
|------|--------|--------|
| Monorepo NX-ish + packages | ✅ | domain, schemas, fixtures, evals, ui, agent-runtime, web, agent-worker |
| Seeded runs + SSE v1 | ✅ | Replay timeline |
| HITL approvals + XState | ✅ | Critical Playwright path |
| Jev gate + eval scorer | ✅ | Mock default; live optional |
| CF Agents worker | ✅ | Env-switchable transport |
| Phase B UI + P0/P1 polish | ✅ | Query, nuqs, Motion, uPlot, density, ⌘K |
| Testing/health/help/logs/prefetch | 🔄 | Queued / in flight |

---

## 4. Multi-agent & pipelines — product decision

### Do (aligned with thesis)

| ID | Feature | Why it belongs |
|----|---------|----------------|
| **M1** | Nested agent runs in the event model | Communication is data, not a side chat |
| **M1** | Parent timeline shows spawn / message / await / join | Recruiter *sees* multi-agent |
| **M1** | Child drill-in (same Run Detail) | Mirrors Cloudflare agent-as-tool UX |
| **M1** | Colored Logs include agent-to-agent messages | Completes the story with download .txt |
| **M2** | `/runs/[id]/graph` Aggregated \| Expanded | Langfuse-class observe graph |
| **M3** | `/pipelines` template gallery + mini graph | “Pipelines” without 27-node IDE |
| **M3** | Node types ≤5: Agent, Tool, JevGate, HumanApprove, EvalGate | Enough to teach the product |
| **M4** | CF sub-agent / Workflow adapter | Same UI, real durable runtime |

### Don't (anti-goals)

- Full drag-drop orchestration IDE (OrchStack / Build A Harness class)
- Compile to LangGraph / CrewAI / Mastra
- Kafka / Redis agent mesh
- Realtime collab cursors on canvas
- Replacing HITL/evals with “more agents”

---

## 5. Domain model extensions (architect)

```
AgentRef { id, name, role, modelHint? }
PipelineSpec { id, name, nodes[], edges[] }   // template only in M3

Domain events (additive):
  AgentSpawned { parentRunId, childRunId, agent }
  AgentMessage { from, to, channel, payloadSummary, level }
  AgentAwait { waiterRunId, awaitedRunId }
  AgentJoined { parentRunId, childRunId, outcome }

Run gains:
  parentRunId?: string
  childRunIds?: string[]
  agents?: AgentRef[]
```

**Invariant:** child runs are first-class `AgentRun`s; parent fold stays pure; UI never invents edges not in events.

**Ports:** `AgentTransport.spawnChild?` later; fixtures implement today.

---

## 6. Library stack (locked recommendations)

### Keep
| Concern | Lib |
|---------|-----|
| App | Next.js App Router, React 19, TS strict |
| Server state | TanStack Query + nuqs |
| HITL flow | XState v5 |
| UI | Tailwind v4 + CVA/shadcn-style `@tracebench/ui` |
| Motion | `motion` + CSS; View Transitions optional |
| Streaming charts | uPlot |
| Decision layer | Jev (mock/live) |
| Runtime option | Cloudflare Agents (DO) |
| E2E | Playwright |
| Unit | Vitest |

### Add (multi-agent / help / quality)
| Concern | Lib | Why |
|---------|-----|-----|
| Agent / pipeline graph | **`@xyflow/react`** | MIT, React-native, observe + light edit |
| Product tour | **React Joyride v3** | React 19, Floating UI, a11y |
| Component tests | Storybook 10 + Vitest browser + MSW 2 | Stories = tests |
| Synthetics | Checkly MaC (scaffold) | Same Playwright DNA |
| Toasts | `sonner` (or equivalent light) | Ops feedback |

### Avoid
Intro.js (license), Shepherd commercial friction, R3F in product routes, ECharts for our volume, Redux, Cypress.

---

## 7. Roadmap (PO prioritization)

### Now (in flight / finish)
1. Storybook + MSW + a11y + `/api/health` + Checkly scaffold  
2. UX audit polish (toasts, press, kbd chips, focus restore, skeletons)  
3. Prefetch/preload + Logs panel (color + `.txt`)  
4. Help: `/help` + Joyride + contextual `?` + `llms.txt`

### Next — Multi-agent slice (ship in order)

**M1 — Nested agents (1–2 days)**  
- Fixture: `run_pipeline_ops` with 3 agents (Planner → Researcher → Executor)  
- Events + Logs messages  
- Run detail: children list + “Open child”  
- Success: recruiter sees A2A messages without leaving the product metaphor  

**M2 — Graph observe (1–2 days)**  
- `/runs/[id]/graph` with Aggregated/Expanded  
- Click node → scroll/highlight timeline  
- Success: screenshot-worthy Langfuse-like graph  

**M3 — Pipelines lite (2 days, optional for CV spike)**  
- `/pipelines` list of 2 templates  
- Read-mostly xyflow; edit layout optional; **Run** clones fixture  
- Success: “I designed a HITL pipeline” talk-track without IDE bloat  

**M4 — CF sub-agents (later)**  
- Only after GitHub/Vercel deploy story  

### Later / park
- Ask AI on docs  
- LiveStore  
- Full dashboard DnD builder (Phase C from earlier) — after M1–M2  
- Chromatic paid visual suite  

---

## 8. Feature backlog by surface (product engineer)

### Runs
- Nested children, graph tab, richer Logs, prefetch on hover  

### Approvals / Policy
- Jev decision visible on timeline; toast on decide; kbd ⏎  

### Evals
- Scorer badge; link “why gate failed”  

### Pipelines (M3)
- Templates only; no freeform node palette explosion  

### Help
- Tour once; restart from Help; ⌘K articles  

### Platform
- Health readiness 503; Checkly critical path; Storybook for ApprovalGate/Timeline  

---

## 9. Success metrics (definition of done for “portfolio ready”)

- [ ] Recruiter path &lt; 90s without narration  
- [ ] `pnpm test && pnpm eval && pnpm test:e2e && pnpm build` green  
- [ ] Health endpoint honest (503 on fail)  
- [ ] One multi-agent fixture + graph view  
- [ ] Help tour + `/help`  
- [ ] ADR set: events, Jev, multi-agent  
- [ ] README + ARCHITECTURE + PRODUCT_PLAN consistent  
- [ ] GitHub `dpawlikowski/tracebench` + deploy (when user ready)  

---

## 10. Interview talk-tracks (PO → engineer)

1. “Chat is secondary; the product is the **control plane for irreversible tools**.”  
2. “Runs are **event-sourced**; multi-agent is nested runs + messages, not a second database.”  
3. “Jev answers **calibrated questions**; policy stays in code.”  
4. “Graph is **observe-first** — authoring is templates, not a fake Zapier.”  
5. “Fixtures and Cloudflare share **AgentTransport** — same UI.”  

---

## 11. Explicit non-roadmap (say no)

Building a general multi-agent OS, competing with Langfuse cloud, or shipping agent mesh infra. Tracebench wins by being a **sharp Senior FE showpiece**, not a platform company.

---

## 12. Stage C & D (post M1/M2) — Product Owner plan

Depends on: **M1 nested agents + M2 observe graph** shipped. Do not start C before A2A is visible in timeline/Logs/graph.

### Stage C — Ops Surfaces (compose + deepen)

**Goal:** Recruiter can compose a live Ops Board and inspect A2A traffic like a real control room — still zero-key fixtures.

| Slice | Deliverable | Libs / notes | DoD |
|-------|-------------|--------------|-----|
| **C1 — Logs A2A upgrade** | Level `a2a`; from→to; follow/tail on Replay; JSON expand/copy; JSONL download; click line → timeline | Extend `derive-logs` + `RunLogs` | Filter `a2a` shows only AgentMessage; download JSONL works |
| **C2 — `/dashboards` DnD v1** | Grid edit mode; 8–9 widgets; persist layout `localStorage`; presets Live Run + Fleet/Release | `react-grid-layout` v2, Recharts 3 (KPI/bar/donut), uPlot (stream tiles) | Edit → save → reload keeps layout; widgets read same run/evals APIs |
| **C3 — Widget set v1** | cost burn · latency p95 · tokens · approval wait · Jev escalate % · eval pass · tool mix · **A2A msg rate** · pending HITL | Data from fixtures/events/metrics | Each widget has empty + loading state |
| **C4 — Promote to tile** | From MetricsRail sparkline: “Add to dashboard” | Query + layout merge | One click adds tile to Live Run board |

**Stage C anti-goals:** Cube/semantic layer, 20 chart types, WebGL tiles, collab multiplayer boards, paid Chromatic requirement.

**Stage C talk-track:** “Metrics are projections of the event log; the dashboard is a layout preference, not a second source of truth.”

### Stage D — Pre-ship excellence (raise hiring signal)

**Goal:** Before any public URL, Tracebench must *prove judgment* the way 2026 hiring managers skim portfolios: measurable quality, honest evals, keyboard/a11y, demo narrative, architecture diagram — not just features.

Ship moves to **Stage E**.

| Slice | Deliverable | Why (research) | DoD |
|-------|-------------|----------------|-----|
| **D1 — Evidence pack** | README rewrite: problem → approach → results table (eval gate, e2e, health) → how to run → limitations → next | AutomateEdge/GreatFrontEnd: README is the portfolio | Recruiter can decide in 60s |
| **D2 — Architecture story** | Mermaid/diagram in `/help` or `/architecture` + ADR index | Seniors show tradeoffs | 1 page, link from README |
| **D3 — Perf & a11y budget** | Lighthouse CI or scripted scores on `/`, `/runs`, `/runs/[id]`; axe on key stories | Showproof: publish LCP/a11y numbers | Perf ≥90 / a11y ≥95 mobile target (document actuals) |
| **D4 — Demo artifact** | 60–90s silent GIF or unlisted Loom: Replay → Jev/HITL → Evals → Graph | Techademy: 2–3 min demo lifts offers | Embedded at top of README |
| **D5 — Failure gallery** | `/help` or README: 2 intentional eval fails + denied run explained | “Show failures” = senior signal | Linked from Results |
| **D6 — OG / SEO / share** | OpenGraph image, titles, `llms.txt` polish, sitemap if needed | Shareable case study cards | Preview looks premium on LinkedIn |
| **D7 — Keyboard tour** | Documented shortcuts + Joyride “Restart”; Playwright covers ⌘K + approve | a11y as product, not checklist | Help article + e2e |
| **D8 — Optional spike** | M3 pipeline templates screenshot only | Extra wow if time | Skip if timebox |

**Stage D anti-goals:** New platform features, auth systems, paid Chromatic as blocker, redesign for redesign’s sake.



### Stage D — Demo Mode contract (zero external agents)

**Hard requirement:** Recruiter (or you) runs `pnpm install && pnpm dev` and **przeklika** every primary surface with **no** Cloudflare, **no** Jev/AI Gateway key, **no** live LLM.

| Surface | Demo source when disconnected |
|---------|-------------------------------|
| Runs / Replay / SSE | `AGENT_TRANSPORT=fixture` (default) + seeded runs |
| HITL approve/deny | In-memory store + fixture pending approvals |
| Jev gate + evals | `JEV_ADAPTER=mock` / `EVAL_SCORER=mock-jev` (default) |
| Multi-agent (M1/M2) | Seeded parent+children + AgentMessage events |
| Graph | Built from fixture events only |
| Logs / A2A | Derived from same fixtures |
| Dashboards (C) | Widgets from fixture aggregates; layout localStorage |
| Help / tour | Static MDX + Joyride; skip auto-tour under Playwright |
| Health | Reports `fixture` + `mock` — **200** when demo-healthy |

**Env defaults** (README + `.env.example`):
```
AGENT_TRANSPORT=fixture
JEV_ADAPTER=mock
EVAL_SCORER=mock-jev
```

**Demo script:** `docs/DEMO_SCRIPT.md` — 90s click path (HITL → A2A logs → Graph → Evals → Dashboards → Help).

**Smoke:** `pnpm demo:check` (or documented) = health 200 + critical e2e on fixtures only.


### Stage E — Ship (public)

**Goal:** Live URL + GitHub + site case study. Frictionless path: resume → repo → demo → case study.

| Slice | Deliverable | DoD |
|-------|-------------|-----|
| **E1 — GitHub** | `dpawlikowski/tracebench` (needs your empty repo) | Public, good README, screenshots |
| **E2 — Deploy** | Vercel app (fixture default); doc CF/Jev envs | Stable prod URL, health 200 |
| **E3 — Synthetics** | Checkly (or cron) against prod critical path + `/api/health` | Alert path documented |
| **E4 — Case study** | dpawlikowski.pl page | Linked both ways |
| **E5 — CI badges** | test · eval · e2e · lighthouse · health | Green on main |

**Stage E anti-goals:** Blocking on M4 CF sub-agents, multi-tenant, real LLM spend for demo.

### Sequencing (locked)

```
… → M1 → M2 → Stage C (C1–C4) → Stage D (D1–D7) → Stage E (E1–E5)
```

### Effort (order-of-magnitude)

- C1: 0.5–1 day  
- C2+C3: 2–3 days  
- C4: 0.5 day  
- D1–D7: 2–3 days (evidence/demo/Lighthouse)\n- E1–E5: 1–2 days (depends on user GitHub/Vercel)

