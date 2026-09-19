# ADR 0004 — Light Ops Telemetry port (OTel GenAI–shaped)

- **Status:** Accepted · **Shipped UI** `/ops` + run-detail Ops Trace
- **Date:** 2026-09-19 (UI 2026-09-20)

## Context

Tracebench needs a future-proof **ops** layer for multi-model workers without adopting a heavy second platform (Inngest/Trigger). We already chose Cloudflare Agents for durable runs (scaffold: persist/HITL/SSE — not LLM loops yet).

## Decision

1. Keep orchestration on **Cloudflare Agents** (+ optional **Workflows** later for multi-step / approval waits). UI **observes**.
2. Add an **`OpsTelemetry` port** that emits spans shaped like OpenTelemetry GenAI conventions:
   - `invoke_agent` · `chat` · `execute_tool` · `tool_approval`
3. **Default adapter:** `FixtureOpsTelemetry` — derive spans from domain events / fixtures (Demo Mode, zero keys). Env: `OPS_TELEMETRY=fixture`.
4. **Future adapters (not blocking demo):** `OtlpOpsTelemetry` (export), Cloudflare Workers Observability / agent tracing when live LLM loops land.
5. UI: **Ops Trace** panel on run detail + `/ops` fleet view — read-only timeline of spans. Extensible, not a second product.

## Anti-goals

- Do not add Inngest/Trigger.dev for portfolio v1.
- Do not require real LLM keys for telemetry demo.
- Do not replace domain event sourcing — telemetry **projects** from events / adapters.
- Do not imply the worker already runs multi-LLM agent loops.

## Consequences

- Interview story: “same ports as transport — fixture today, OTLP/CF tomorrow.”
- Worker can later wrap AI SDK / custom spans without UI rewrite.
- See `docs/ops-telemetry.md`.
