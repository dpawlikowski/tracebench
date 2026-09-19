# ADR 0004 — Light Ops Telemetry port (OTel GenAI–shaped)

## Status
Accepted — 2026-09-19

## Context
Tracebench needs a future-proof **ops** layer for multi-model workers without adopting a heavy second platform (Inngest/Trigger). We already chose Cloudflare Agents for durable runs.

## Decision
1. Keep orchestration on **Cloudflare Agents** (+ optional **Workflows** later for multi-step / approval waits).
2. Add an **`OpsTelemetry` port** that emits spans shaped like OpenTelemetry GenAI conventions:
   - `invoke_agent` · `chat` · `execute_tool` · `tool_approval`
3. **Default adapter:** `FixtureOpsTelemetry` — derive spans from domain events / fixtures (Demo Mode, zero keys).
4. **Future adapters (not blocking demo):** `OtlpOpsTelemetry` (export), Cloudflare Workers Observability / agent tracing when live LLM loops land.
5. UI: thin **Ops Trace** panel on run detail (and optional `/ops` stub) — read-only timeline of spans. Extensible, not a second product.

## Anti-goals
- Do not add Inngest/Trigger.dev for portfolio v1.
- Do not require real LLM keys for telemetry demo.
- Do not replace domain event sourcing — telemetry **projects** from events / adapters.

## Consequences
- Interview story: “same ports as transport — fixture today, OTLP/CF tomorrow.”
- Worker can later wrap AI SDK / custom spans without UI rewrite.
