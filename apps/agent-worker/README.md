# Tracebench agent-worker

**As of 2026-09-20.** Docs map: [`docs/INDEX.md`](../../docs/INDEX.md).

Cloudflare **Agents** (Durable Objects) runtime for Tracebench runs.

**Honesty:** this is a **scaffold** for DO persist / HITL / SSE — **not** LLM agent loops yet. Real multi-LLM orchestration would live here later; the Next UI only observes via `AgentTransport`.

Default product path stays **fixture Demo Mode** (`AGENT_TRANSPORT=fixture`) — no Cloudflare account or API keys required.

- One `RunAgent` DO instance per `runId`
- Domain events in DO **SQLite** (`domain_events`)
- SSE **v1** frames (same envelope as Next `/api/runs/[id]/stream`)
- HITL approve/deny → `decideApproval` → append events → `fold`

## Requirements

- **Node.js ≥ 22** for Wrangler 4 (`fnm install 22` / `nvm install 22`). The rest of Tracebench still runs on Node ≥ 20.

## Local (no Cloudflare account secrets)

```bash
cd /workspace/tracebench
pnpm install
pnpm --filter @tracebench/agent-worker dev
# → http://127.0.0.1:8787
```

`wrangler dev` runs Durable Objects locally. You do **not** need API tokens for the fixture path.

Smoke:

```bash
curl -s http://127.0.0.1:8787/health
curl -s http://127.0.0.1:8787/api/runs | head
curl -s http://127.0.0.1:8787/api/runs/run_live_approve | head
curl -N "http://127.0.0.1:8787/api/runs/run_live_approve/stream?speed=50" | head
curl -s -X POST http://127.0.0.1:8787/api/runs/run_live_approve/approve \
  -H 'content-type: application/json' \
  -d '{"approvalId":"ap_lv_2","decision":"approved"}'
curl -s http://127.0.0.1:8787/api/runs/run_live_approve/events
```

## Point Next at the worker

```bash
# terminal 1
pnpm --filter @tracebench/agent-worker dev

# terminal 2
AGENT_TRANSPORT=cloudflare CF_AGENT_URL=http://127.0.0.1:8787 pnpm dev
```

Default remains `AGENT_TRANSPORT=fixture` (in-process) so Playwright e2e stays green without wrangler.

## Deploy (optional)

```bash
pnpm --filter @tracebench/agent-worker exec wrangler login   # once
pnpm --filter @tracebench/agent-worker deploy
```

See also: [`docs/cloudflare-agents.md`](../../docs/cloudflare-agents.md) · ports overview in [`ARCHITECTURE.md`](../../ARCHITECTURE.md).
