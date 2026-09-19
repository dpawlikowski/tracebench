# Ops Telemetry

Light, extensible ops tracing for Tracebench. **Not** Inngest/Trigger — orchestration stays on Cloudflare Agents; this port only **projects** GenAI-shaped spans for a read-only Ops Trace UI.

## ADR

See [`docs/adr/0004-ops-telemetry-port.md`](./adr/0004-ops-telemetry-port.md).

## Span names (OTel GenAI–shaped)

| Name | Source (fixture) |
|------|------------------|
| `invoke_agent` | Run lifecycle (+ `agent_spawn` children) |
| `chat` | Timeline thoughts (+ `agent_message`) |
| `execute_tool` | `toolCalls` (optional cost / tokens) |
| `tool_approval` | `approvals` |

## Factory

```bash
# default — Demo Mode, zero keys
OPS_TELEMETRY=fixture
```

```ts
import { createOpsTelemetry, getOpsTelemetry } from "@tracebench/agent-runtime";

const tel = createOpsTelemetry({ kind: process.env.OPS_TELEMETRY ?? "fixture" });
const spans = await tel.getSpansForRun(runId);
const rows = await tel.listRunSummaries();
```

`FixtureOpsTelemetry` derives spans via `projectSpansFromRun(AgentRun)` (and optionally `projectSpansFromEvents(DomainEvent[])`).

## UI

- Run detail → **Ops Trace** panel (mono labels, Phosphor)
- `/ops` → recent fixture runs with span counts by name
- APIs: `GET /api/ops/runs`, `GET /api/ops/runs/[id]`

## Extending later

1. **OTLP** — implement `OtlpOpsTelemetry` that exports the same `OpsSpan` shape (no UI rewrite).
2. **Cloudflare Agents** — wrap AI SDK / Workers Observability spans into `OpsSpan` and select via `OPS_TELEMETRY=cloudflare`.
3. Keep domain event sourcing as source of truth; telemetry **projects**, it does not replace reduce/fold.

No real OTLP exporter is required for the zero-key demo.
