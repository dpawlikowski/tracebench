# Cloudflare Agents runtime (Tracebench)

Light durable runtime behind the same ports as the fixture demo.

## Why

Phase A made runs **event-sourced** (`reduce` / `decideApproval` in `@tracebench/domain`) and SSE **v1**.  
The next slice swaps the **adapter**, not the product:

| Port | Fixture (`pnpm dev`) | Cloudflare |
|------|----------------------|------------|
| `AgentTransport` | `FixtureAgentTransport` (in-memory) | `CloudflareAgentTransport` → `apps/agent-worker` |
| Persistence | process memory | Durable Object **SQLite** (`domain_events`) |
| Addressing | singleton store | **one DO per `runId`** |

No Kafka/Redis. Zero API keys on the default path.

## Packages

```
packages/agent-runtime   ports + Fixture + Cloudflare HTTP client + SSE encode
apps/agent-worker        Cloudflare Agent (RunAgent DO) + wrangler
apps/web                 selects transport via AGENT_TRANSPORT
```

## Local worker

Requires **Node ≥ 22** (Wrangler 4). Fixture / Next path remains Node ≥ 20.


```bash
pnpm --filter @tracebench/agent-worker dev   # :8787, local DOs
```

Details and curl smoke: [`apps/agent-worker/README.md`](../apps/agent-worker/README.md).

## Next env switch

```bash
# default — e2e / recruiter demo
AGENT_TRANSPORT=fixture

# optional — durable path
AGENT_TRANSPORT=cloudflare
CF_AGENT_URL=http://127.0.0.1:8787
```

## HITL path (both adapters)

```
POST approve
  → decideApproval(cmd)           # domain command
  → DomainEvent[]                 # ApprovalDecided + ToolCallFinished + RunCompleted
  → fold/reduce → AgentRun        # projection
  → (CF) INSERT domain_events     # DO SQLite
```

SSE clients always see `{ v: 1, type: "event" | "snapshot" | "heartbeat" | "error", ... }`.

## Interview line

> “Fixtures and Cloudflare Agents implement the same `AgentTransport`. Approvals are commands that append events; the DO is just durable storage + addressing per run.”

## List endpoint caveat

`GET /api/runs` on the worker returns **fixture summaries** (fast). Per-run `GET` / approve / events hit the DO and reflect persisted events. A future improvement can fan-out `get` across known runIds when listing.

## Node version

| Surface | Node |
|---------|------|
| `pnpm dev` / e2e / eval | ≥ 20 |
| `pnpm dev:agent` (Wrangler 4) | ≥ 22 |
