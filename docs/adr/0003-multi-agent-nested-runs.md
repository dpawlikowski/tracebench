# ADR 0003 — Multi-agent as nested runs

- **Status:** Accepted (M1/M2 shipped)
- **Date:** 2026-09-20

## Context

Tracebench must show multi-agent collaboration without becoming a workflow IDE. Recruiters need to *see* spawn / message / await / join in the same control-plane metaphor as HITL.

## Decision

1. **Child runs are first-class `AgentRun`s** with optional `parentRunId`, `childRunIds`, `agents[]`.
2. **Additive domain events:** `AgentSpawned`, `AgentMessage`, `AgentAwait`, `AgentJoined` — projected into timeline kinds `agent_spawn` | `agent_message` | `agent_await` | `agent_join`.
3. **UI never invents edges** — graph (M2) and Logs derive only from events / run linkage.
4. **Fixtures implement today** (`run_pipeline_ops` + children); `AgentTransport.spawnChild` is a later port.

## Consequences

- Pure `reduce` stays free of React/Next.
- Parent awaiting_approval can reflect a child HITL pause without merging stores.
- Observe-only xyflow graph is a projection, not an authoring surface (M3 templates remain optional).
- Graph/children UI uses dumb hooks `useChildRuns` / `useRunsDetails` — views take `AgentRun[]`; UI does not unwrap Query.
