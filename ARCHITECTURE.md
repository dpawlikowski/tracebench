# Tracebench Architecture (v2 target)

Senior FE portfolio showpiece: **HITL Agent Ops Workbench** — not a chat wrapper.

## 0. Design north star

Prove four senior skills in one live URL:

1. **Domain modeling** — run / tool / approval / audit / eval as first-class contracts
2. **Realtime UX** — streaming timeline + interruptible HITL without spaghetti state
3. **Platform FE** — monorepo boundaries, design system, typed BFF
4. **Quality as product** — eval gate + Playwright on irreversible paths

Constraint: demo must run **zero API keys** (fixtures + simulated agent runtime). Optional live LLM adapter later behind the same ports.

---

## 1. Current state (v0.1 — shipped)

```
apps/web              Next 15 App Router + React 19, in-memory store, SSE replay
packages/schemas      Zod contracts (run, tool, approval, audit, metrics, eval)
packages/fixtures     Tool catalog + 5 seeded OpsAgent runs
packages/evals        Golden set + CLI gate
packages/ui           Tokens + hand-rolled primitives (no Tailwind yet)
```

**What is already good**

- Clear product surface (runs / detail / evals)
- Zod as source of truth
- SSE replay + approval mutation + audit
- Vitest + Playwright critical path

**What is thin (expected for MVP)**

- UI kit is custom CSS, not a portfolio-grade DS
- No TanStack Query / URL state / feature modules
- Domain logic lives partly in `apps/web/lib/store.ts` (should be a package)
- NX is present but underused (no tags / enforce-module-boundaries)
- No event-sourced run runtime — store mutates run documents imperatively

---

## 2. Target architecture (v2)

### 2.1 Layered monorepo

```
apps/
  web/                      # composition root only (routes, providers, wiring)
  agent-worker/             # Cloudflare Agents RunAgent DO (optional durable adapter)
packages/
  domain/                   # pure TS: entities, invariants, reduce(event) → state
  contracts/                # Zod + shared DTO / SSE event envelopes (rename from schemas)
  fixtures/                 # seed data implementing contracts
  evals/                    # golden sets + scorers + CLI
  agent-runtime/            # AgentTransport ports + Fixture + Cloudflare HTTP client
  api-client/               # typed fetch / oRPC client + query keys
  ui/                       # design system (tokens → primitives → patterns)
  features-runs/            # run list + detail UI (optional split when fat)
  features-evals/
  features-approvals/
tooling/
  eslint-config/
  tsconfig/
```

**Dependency rule (enforce with Nx tags)**

```
features → ui, api-client, contracts
api-client → contracts
agent-runtime → domain, contracts, fixtures
domain → contracts (types only; no React, no Next)
apps/web → features/*, ui, api-client
❌ features must not import apps/*
❌ ui must not import domain/runtime
❌ domain must not import fixtures
```

### 2.2 Domain core — event-sourced run

Treat a run as a **fold over events**, not a bag of mutable fields:

```
Events:
  RunStarted | ThoughtEmitted | ToolCallStarted | ToolCallFinished
  ApprovalRequested | ApprovalDecided | RunCompleted | RunFailed

reduce(state, event) → state     // pure, unit-tested
replay(events, speed) → AsyncIterable<event>   // demo stream
```

Approvals are **commands** that append `ApprovalDecided` — same path for fixture demo and future live agents.

Interview gold: “UI is a projection of an event log; HITL is a command, not a boolean flip.”

### 2.3 Ports & adapters (hexagonal lite)

```
ports/
  RunRepository        list / get
  AgentTransport       listRuns | getRun | subscribe(runId) | decideApproval  // fixture | cloudflare

adapters/
  FixtureAgentTransport      // default pnpm dev — in-memory + domain fold
  CloudflareAgentTransport   // HTTP → apps/agent-worker
  RunAgent (Durable Object)  // one instance per runId; SQLite domain_events
  SseBridge / sse-encode     // maps timeline → StreamFrame v1
```

`apps/web` Route Handlers select transport via `AGENT_TRANSPORT` — no business rules in `route.ts`.
See `docs/cloudflare-agents.md`.


### 2.3.1 Jev risk gate (mock-first)

```
JevAdapter port
  MockJevAdapter     // DEFAULT — deterministic, zero keys
  LiveJevAdapter     // optional — experimental_evaluate + typesafe-ai/jev (AI Gateway OIDC)

decideToolGate(catalogRisk, evaluation) → auto_allow | escalate_hitl | deny
  high confidence + low risk → auto_allow
  else → escalate_hitl
  live errors → fail closed (deny) for high-risk / irreversible
```

Env: `JEV_ADAPTER=mock|live` (default `mock`). See `docs/adr/0002-jev-risk-policy.md` + `docs/jev.md`.
UI: `/policy` · API: `/api/policy/evaluate`.

**Eval / release scorer** (same adapter): questions `policy_ok` / `faithfulness_proxy` / `cost_anomaly`.
Default `pnpm eval` + `/evals` use **mock-jev**; `EVAL_SCORER=rules` for legacy; `JEV_ADAPTER=live` → live-jev.

### 2.4 Frontend application architecture

| Concern | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js 15/16 App Router + React 19** | RSC for landing/evals shell; client islands for ops console |
| Server state | **TanStack Query v5** | cache, invalidate on approval, stream hydration |
| URL state | **nuqs** | selected run, replay speed, eval filters — shareable recruiter links |
| Client/session UI state | **Zustand** (tiny) | replay cursor, modal open — not server data |
| HITL workflow | **XState v5** (approval + replay actors) | visible statechart = architecture flex for seniors |
| Styling | **Tailwind CSS v4** + CSS variables | 2026 default; pairs with AI codegen |
| UI kit | **shadcn/ui** + custom **ops patterns** | own the code; Colloid narrative |
| AI-native chrome (secondary) | **AI Elements** (Vercel) | tool/reasoning blocks — reuse patterns, not own chat product |
| Tables | **TanStack Table** + **TanStack Virtual** | evals + long timelines |
| Charts | **Recharts** or **unovis** | cost/latency sparklines |
| Forms / cmd palette | **react-hook-form + zod** / **cmdk** | approve reason, jump-to-run |
| API seam | **oRPC** or tRPC **or** Zod-validated Route Handlers | prefer oRPC if we want end-to-end types without GraphQL |
| Motion | **Motion (Framer)** sparingly | timeline enter; respect `prefers-reduced-motion` |
| Observability (demo) | OpenTelemetry web SDK optional | “platform FE” talking point — keep off critical path |

### 2.5 Streaming contract

SSE event envelope (versioned):

```ts
type StreamFrame =
  | { v: 1; type: "event"; event: DomainEvent }
  | { v: 1; type: "snapshot"; run: AgentRun }
  | { v: 1; type: "heartbeat"; ts: string }
  | { v: 1; type: "error"; code: string; message: string }
```

Client: `EventSource` or fetch stream → Query cache patch via `setQueryData` / incremental reducer.

### 2.6 Design system strategy

Three tiers (mirrors Synerise/Colloid story):

1. **tokens** — color, space, type, risk palette (`risk.low|med|high`)
2. **primitives** — Button, Badge, Panel, Modal (shadcn-based)
3. **patterns** — `ToolTimeline`, `ApprovalCard`, `EvalScorecard`, `AuditDrawer`

Storybook (optional phase) + a11y smoke; Playwright owns product-critical paths.

---


## 2.7 Light infra pick (not Kafka / Redis)

**Chosen direction: Cloudflare Agents (`agents` / Durable Objects)** as the optional runtime adapter behind `AgentTransport` + `RunRepository`.

Why this one (exists, light, cool, 2026):
- One Durable Object ≈ one agent run — state + SQLite storage, no broker
- Native **SSE** + resumable streams (`Last-Event-ID`) — matches our timeline
- Built-in **human-in-the-loop / workflows** — HITL approvals are a first-class story
- Hibernation-friendly — cheap for a portfolio demo
- Same ports: fixtures today → Cloudflare Agents adapter later — UI unchanged

**Strong runner-up: LiveStore** — if we want the *client* event-log to be the product (event-sourced SQLite in the browser, pluggable sync). Perfect narrative fit with `packages/domain` reduce; slightly more FE-centric than “agent runtime”.

**Also fine later:** PartyKit (room = `runId` for fan-out) + Turso (append-only event table / db-per-agent). Skip Zero for this app (row sync, not event log; no long offline writes).

MVP stays in-memory + SSE until Phase D needs a deploy story.

## 3. Fresh library stack (opinionated 2026)

**Adopt next (high ROI for portfolio)**

- Tailwind v4 + shadcn/ui
- TanStack Query + nuqs
- XState for approval/replay machines
- TanStack Table/Virtual on evals + timeline
- AI Elements for tool-call presentation patterns (not as product center)
- Biome or ESLint flat + Oxlint if available; Vitest + Playwright stay

**Consider (cool, use sparingly)**

- **oRPC** — typed BFF without tRPC lock-in
- **Effect Schema** *or stay on Zod* — don’t dual-stack unless Effect buys runtime
- **Mastra / AI SDK** behind `AgentTransport` — only after ports exist
- **Turborepo vs deeper Nx** — keep Nx; add `@nx/enforce-module-boundaries`

**Avoid (looks junior / dated in 2026)**

- Redux Toolkit for this app size
- Bare `useEffect` fetch forests
- ChatGPT clone as homepage
- Microservices / Redis / Kafka for a portfolio demo
- CSS-in-JS runtime as primary styling

---

## 4. Execution roadmap

### Phase A — Architecture hardening (1–2 days) ✅
1. Extract `packages/domain` with `reduce` + command handlers; move logic out of `store.ts`
2. Version SSE envelopes (`StreamFrame` v1 in `packages/schemas`); parser in `apps/web/lib/sse.ts` (api-client package deferred to Phase B)
3. Nx tags on all `project.json` + `pnpm check:boundaries` (ESLint `@nx/enforce-module-boundaries` deferred — no ESLint baseline yet)
4. ADR: `docs/adr/0001-event-sourced-runs.md`

**Phase A dependency tags**

| Project | tags |
|---------|------|
| `apps/web` | `scope:app`, `type:app` |
| `packages/domain` | `scope:domain`, `type:lib` |
| `packages/schemas` | `scope:contracts`, `type:lib` |
| `packages/ui` | `scope:ui`, `type:lib` |
| `packages/evals` | `scope:evals`, `type:lib` |
| `packages/fixtures` | `scope:fixtures`, `type:lib` |
| `packages/agent-runtime` | `scope:runtime`, `type:lib` |
| `apps/agent-worker` | `scope:app`, `type:app` |

Enforce today via `node scripts/check-boundaries.mjs` (domain/schemas/fixtures/ui). Wire `@nx/enforce-module-boundaries` when ESLint flat config is introduced.


### Phase B — Platform FE glow-up (2–3 days) ✅
1. Tailwind v4 + shadcn init; migrate tokens
2. Rebuild `ToolTimeline`, `ApprovalGate`, `EvalScorecard` as DS patterns
3. TanStack Query + nuqs on runs/evals
4. XState approval actor (pending → deciding → approved/denied → continue)

### Phase C — Showpiece features (2–3 days)
1. Risk policy matrix UI (which tools need HITL) ✅ — `/policy` + `MockJevAdapter` (default) / optional `LiveJevAdapter`
2. Eval gate as first-class “Release” view (trend sparkline, flake badges)
3. Command palette jump + keyboard ops mode
4. “Architecture” route on the app itself (live diagram + talk track)

### Phase D — Ship (1 day)
1. GitHub `dpawlikowski/tracebench`
2. Vercel deploy + Lighthouse/a11y sanity
3. Case study page on dpawlikowski.pl linking live demo
4. 90s loom / GIF of approve → audit → eval

### Non-goals until after D
Multi-tenant auth, real payments, multi-agent orchestration framework, Storybook Chromatic CI.

---

## 5. Interview talk-track (keep honest)

- “Chat is a side channel; the product is **control plane for irreversible tools**.”
- “Runs are **event-sourced**; UI is a projection; approvals are commands.”
- “Fixtures implement the same `AgentTransport` port a live model would.”
- “Eval gate is how we know we didn’t ship vibes.”
- “Package boundaries mirror how I’d structure a real AI platform monorepo.”

---

## 6. Success metrics for v2

- Recruiter path &lt; 90s without explanation
- Lighthouse a11y ≥ 90 on `/runs/[id]`
- Playwright: deny path + approve path + eval gate fail visibility
- `pnpm eval` in CI
- One ADR + architecture route — judgment artifact, not only code
