# Tracebench — 90s demo script (fixtures only)

**Prereq:** `pnpm install && pnpm dev`  
Defaults: `AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`.  
**No API keys. No Cloudflare. No live agents.**

In-app: header **Demo mode** → Start 90s click path, or `/help/demo-mode`.

## Seeded run IDs

| ID | Status | Use |
|----|--------|-----|
| `run_live_approve` | awaiting_approval | Primary HITL (high-risk payment) |
| `run_pipeline_ops` | awaiting_approval | Multi-agent parent (A2A + graph) |
| `run_child_researcher` | succeeded | Child — research tools |
| `run_child_executor` | awaiting_approval | Child — HITL on execute_payment |
| `run_pay_vendor_ok` | succeeded | Happy path + rich sparklines |
| `run_deploy_denied` | denied | Human deny + audit |
| `run_refund_fail` | failed | Mid-run failure |
| `run_eval_regress` | succeeded | Cost regression for expect-fail evals |

Catalog: `packages/fixtures/src/demo-seeds.ts` (`DEMO_SEEDS`).

## Click path

1. **Landing** — decision microcopy (awaiting · burn · Jev escalated).
2. **Runs** — confirm all statuses above appear; open `run_live_approve`.
3. **Replay** — timeline + sparklines; **Review** → Approve (⌘Enter) or Deny.
4. **Multi-agent** — `run_pipeline_ops` → children rail → **Logs** filter `a2a` → Download `.txt` / `.jsonl`.
5. **Graph** — `/runs/run_pipeline_ops/graph` → Aggregated → Expanded; click a node.
6. **Evals** — `/evals` mock-jev; note `expect-fail` rows ([failure gallery](/help/failure-gallery)).
7. **Policy** — `/policy` mock matrix (non-empty).
8. **Boards** — `/dashboards` Live Run; every widget non-zero from fixtures.
9. **Help** — restart tour; `/architecture`.

## Health / smoke

```bash
pnpm health
pnpm demo:check          # expects demoMode.kind=demo (dev must be up)
curl -i 'http://127.0.0.1:3000/api/health?force=down'  # → 503
```

## Opt-in live (not required)

See `apps/web/.env.example` — Cloudflare / live Jev only when explicitly set.
