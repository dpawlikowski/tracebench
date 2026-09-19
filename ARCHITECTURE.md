# Tracebench Architecture (as of 2026-09-20)

Senior FE portfolio showpiece: **HITL Agent Ops Workbench** — not a chat wrapper.

**Default product path:** Portfolio Demo Mode — `AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`. Zero API keys. No multi-tenant/auth.

Docs map: [docs/INDEX.md](./docs/INDEX.md).

---

## 0. Design north star

Prove four senior skills in one live (or local) URL:

1. **Domain modeling** — run / tool / approval / audit / eval as first-class contracts
2. **Realtime UX** — streaming timeline + interruptible HITL without spaghetti state
3. **Platform FE** — monorepo boundaries, Phosphor Instrument DS, typed BFF
4. **Quality as product** — eval gate + Playwright on irreversible paths

Constraint: demo must run **zero API keys** (fixtures + simulated agent runtime). Optional live / Cloudflare adapters behind the same ports.

---

## 1. Shipped monorepo (Stages A–D)

```
apps/
  web/                      # composition root (routes, providers, wiring)
  agent-worker/             # Cloudflare Agents RunAgent DO scaffold (optional)
packages/
  domain/                   # pure TS: entities, invariants, reduce(event) → state
  schemas/                  # Zod contracts (conceptual “contracts”; rename deferred)
  fixtures/                 # seed data implementing contracts
  evals/                    # golden sets + scorers + CLI
  agent-runtime/            # AgentTransport · JevAdapter · OpsTelemetry
  ui/                       # Phosphor Instrument (tokens → primitives → patterns)
```

**Dependency rule (enforce with Nx tags + `pnpm check:boundaries`)**

```
features / apps/web → ui, agent-runtime, schemas
agent-runtime → domain, schemas, fixtures
domain → schemas (types only; no React, no Next)
❌ ui must not import domain/runtime
❌ domain must not import fixtures
❌ features must not import apps/*
```

| Project | tags |
|---------|------|
| `apps/web` | `scope:app`, `type:app` |
| `apps/agent-worker` | `scope:app`, `type:app` |
| `packages/domain` | `scope:domain`, `type:lib` |
| `packages/schemas` | `scope:contracts`, `type:lib` |
| `packages/ui` | `scope:ui`, `type:lib` |
| `packages/evals` | `scope:evals`, `type:lib` |
| `packages/fixtures` | `scope:fixtures`, `type:lib` |
| `packages/agent-runtime` | `scope:runtime`, `type:lib` |

---

## 2. Domain core — event-sourced run

Treat a run as a **fold over events**, not a bag of mutable fields:

```
Events:
  RunStarted | ThoughtEmitted | ToolCallStarted | ToolCallFinished
  ApprovalRequested | ApprovalDecided | RunCompleted | RunFailed
  AgentSpawned | AgentMessage | AgentAwait | AgentJoined   # ADR 0003

reduce(state, event) → state     // pure, unit-tested
replay(events, speed) → AsyncIterable<event>   // demo stream
```

Approvals are **commands** that append `ApprovalDecided` — same path for fixture demo and Cloudflare DO.

Interview gold: “UI is a projection of an event log; HITL is a command, not a boolean flip.”

See `docs/adr/0001-event-sourced-runs.md`.

---

## 3. Ports & adapters (hexagonal lite)

```
ports/
  AgentTransport       listRuns | getRun | subscribe(runId) | decideApproval
  JevAdapter           evaluate tool gate + golden cases
  OpsTelemetry         getSpansForRun | listRunSummaries   # OTel GenAI–shaped

adapters/
  FixtureAgentTransport      // DEFAULT — in-memory + domain fold
  CloudflareAgentTransport   // HTTP → apps/agent-worker
  RunAgent (Durable Object)  // one instance per runId; SQLite domain_events
  MockJevAdapter / LiveJevAdapter
  FixtureOpsTelemetry        // DEFAULT — project spans from AgentRun / events
```

`apps/web` Route Handlers select adapters via env — no business rules in `route.ts`.

| Env | Default | Docs |
|-----|---------|------|
| `AGENT_TRANSPORT` | `fixture` | `docs/cloudflare-agents.md` |
| `JEV_ADAPTER` | `mock` | `docs/jev.md`, ADR 0002 |
| `EVAL_SCORER` | `mock-jev` | `docs/jev.md` |
| `OPS_TELEMETRY` | `fixture` | `docs/ops-telemetry.md`, ADR 0004 |

### Worker honesty

`apps/agent-worker` is a **scaffold** for DO persist / HITL / SSE — **not** LLM agent loops yet. Real multi-LLM orchestration would live there later; the UI only observes.

### Light infra (not Kafka / Redis)

**Chosen:** Cloudflare Agents (`agents` / Durable Objects) as the optional runtime adapter.

- One Durable Object ≈ one agent run — state + SQLite, no broker
- Native SSE + resumable streams — matches our timeline
- Built-in HITL / workflows story
- Same ports: fixtures today → Cloudflare later — UI unchanged

**Avoid for portfolio v1:** Kafka, Redis mesh, Inngest/Trigger as a second product, Zero (row sync, not event log).

---

## 4. Frontend application architecture

| Concern | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js App Router + React 19** | RSC shells; client islands for ops console |
| Server state | **TanStack Query v5** | cache, invalidate on approval, stream hydration |
| URL state | **nuqs** | filters, shareable recruiter links |
| Client UI state | **Zustand** (tiny) | replay cursor, modal — not server data |
| HITL workflow | **XState v5** | approval + replay actors |
| Styling | **Tailwind CSS v4** + CSS variables | Phosphor tokens in `@tracebench/ui` |
| UI kit | **Phosphor Instrument** (custom, not soft-blue shadcn default) | near-black + `#B8FF3D`, Geist, hairlines, radius 2–6 |
| Tables / charts | TanStack Table/Virtual · uPlot · Recharts (boards) | dense ops |
| Graph | **`@xyflow/react`** observe-only | dumb view + `useChildRuns` |
| Motion | **Motion** sparingly + CSS 3D marketing | honor `prefers-reduced-motion`; no Three.js |
| API seam | Zod-validated Route Handlers | MSW + Zod contracts in tests |
| Observability (demo) | **OpsTelemetry** fixture spans | `/ops` + run-detail Ops Trace |

**Dumb hooks:** `useChildRuns` / `useRunsDetails` unwrap TanStack Query; graph/dashboard views take `AgentRun[]` — UI does not unwrap Query.

Marketing: `/` + `/story` — Control Plane Assembly (CSS 3D + optional Canvas lattice). See `docs/MARKETING_MOTION_V2.md`.

### Streaming contract

```ts
type StreamFrame =
  | { v: 1; type: "event"; event: DomainEvent }
  | { v: 1; type: "snapshot"; run: AgentRun }
  | { v: 1; type: "heartbeat"; ts: string }
  | { v: 1; type: "error"; code: string; message: string }
```

---

## 5. Design system — Phosphor Instrument

Shipped. See `docs/DESIGN_SYSTEM_V2.md`.

- Near-black canvas; depth via surface steps + hairlines (no diffuse panel shadows)
- Accent `#B8FF3D` used surgically
- Geist / Geist Mono; radius 2–6px
- Shared-edge tile grids on ops boards

---

## 6. Roadmap status

| Stage | Status | Notes |
|-------|--------|-------|
| **A** Architecture hardening | ✅ Done | domain, SSE v1, boundaries, ADR 0001 |
| **B** Platform FE glow-up | ✅ Done | Tailwind, Query, nuqs, XState, DS patterns |
| **C** Ops surfaces | ✅ Done | Logs A2A, `/dashboards`, widgets, nested agents, graph |
| **D** Pre-ship excellence | ✅ Done | Evidence pack, Lighthouse actuals, demo GIF, help/FAQ, Phosphor + marketing v2, OpsTelemetry |
| **E** Ship (public) | 🔄 Partial | GitHub `main` + Pages Storybook ✅ · **Vercel deploy still pending** · site case study / CI badges open |

### Non-goals (still)

Multi-tenant auth, real payments, Kafka/Redis agent mesh, full drag-drop orchestration IDE, Three.js on marketing critical path, LLM agent loops in the worker (scaffold only).

---

## 7. Interview talk-track (keep honest)

- “Chat is a side channel; the product is **control plane for irreversible tools**.”
- “Runs are **event-sourced**; UI is a projection; approvals are commands.”
- “Fixtures and Cloudflare Agents implement the same `AgentTransport`.”
- “Ops Trace is a **projection** of GenAI-shaped spans — not a second orchestrator.”
- “Eval gate is how we know we didn’t ship vibes.”
- “Package boundaries mirror how I’d structure a real AI platform monorepo.”

---

## 8. Success metrics

- Recruiter path &lt; 90s without explanation (Demo Mode)
- Lighthouse actuals documented in `docs/perf-a11y-budget.md` (do not invent new numbers)
- Playwright: deny + approve + eval visibility
- `pnpm eval` green with intentional expect-fail rows
- ADRs 0001–0004 + `/architecture` route
