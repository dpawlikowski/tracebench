# ADR 0001 — Event-sourced runs + ports

- **Status:** Accepted
- **Date:** 2026-09-19
- **Deciders:** Dominik Pawlikowski

## Context

Tracebench v0.1 stored `AgentRun` documents as mutable bags of fields. Approval HITL logic lived in `apps/web/lib/store.ts`, mixing persistence, business rules, and demo-specific side effects (tool settlement, audit rows, metrics). That works for a thin MVP but fails three portfolio / platform goals:

1. **Interview clarity** — “approve flips a boolean” is junior; seniors talk about commands, events, and projections.
2. **Adapter swap** — fixture replay and a future live `AgentTransport` must share one mutation path.
3. **Testability** — UI and Next route handlers should not own domain invariants.

We also need a versioned realtime contract so SSE clients do not break when the stream gains heartbeats, snapshots, or errors.

## Decision

1. **Event-sourced run core** in `packages/domain` (pure TypeScript, no React/Next/fixtures):
   - Discriminated `DomainEvent` union: `RunStarted`, `ThoughtEmitted`, `ToolCallStarted`, `ToolCallFinished`, `ApprovalRequested`, `ApprovalDecided`, `RunCompleted`, `RunFailed`.
   - Pure `reduce(state, event) → state` (+ `fold`) with Vitest coverage.
   - Commands (e.g. `decideApproval`) validate intent and return domain events; they do not mutate state directly.
2. **Ports & thin adapters** — `apps/web/lib/store.ts` is an in-memory `RunRepository` adapter: hold projections, append by folding command events. Route handlers stay transport-only.
3. **Contracts stay in `packages/schemas`** (conceptual “contracts” package; rename deferred to avoid churn). Wire SSE as versioned frames:

   ```ts
   type StreamFrame =
     | { v: 1; type: "event"; event: DomainEvent }
     | { v: 1; type: "snapshot"; run: AgentRun }
     | { v: 1; type: "heartbeat"; ts: string }
     | { v: 1; type: "error"; code: string; message: string }
   ```

4. **Nx tags** — `scope:app|domain|contracts|ui|evals|fixtures` and `type:app|lib`, with dependency rules documented and checked by `scripts/check-boundaries.mjs` until `@nx/enforce-module-boundaries` is wired without breaking the zero-ESLint baseline.

## Consequences

### Positive

- HITL is a **command** that appends `ApprovalDecided` (plus consequential events); UI is a **projection**.
- Domain tests run without Next or the browser.
- SSE v1 allows additive stream features without silent client breakage.
- Clear package boundary: domain → schemas only.

### Negative / trade-offs

- Fixture runs are still **seeded as full documents**, not rebuilt from historical event logs (acceptable for demo; live agents can append from empty/`RunStarted`).
- `packages/schemas` was not renamed to `contracts` yet — tags use `scope:contracts` while the folder remains `schemas`.
- Full event→timeline rebuild for every fixture is deferred; stream maps timeline rows → domain events for replay only.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Keep imperative `store.decideApproval` | Couples demo adapter to policy; hard to reuse behind live agents. |
| Redux / Zustand as source of truth | Server/domain logic would still leak into client store. |
| Full CQRS + Redis/Kafka | Overkill for a zero-key portfolio demo. |
| Unversioned SSE forever | Cheap now, tax later when heartbeats/errors appear. |

## Follow-ups (not this ADR)

- Phase B: XState approval actor + TanStack Query stream hydration.
- **Done (A+):** Cloudflare Agents `RunAgent` DO + `packages/agent-runtime` ports (`docs/cloudflare-agents.md`).
- Promote `scripts/check-boundaries.mjs` to `@nx/enforce-module-boundaries` when ESLint flat config lands.
