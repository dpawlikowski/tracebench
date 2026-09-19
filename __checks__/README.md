# Checkly Monitoring-as-Code (optional)

Scaffold only — **no Checkly account required** to keep the repo valid.

Point at a public Demo Mode URL after **Stage E Vercel deploy** (still pending as of 2026-09-20). Until then, use local health:

| Command | Purpose |
|---------|---------|
| `pnpm exec checkly test` | Dry-run checks (needs `checkly login`) |
| `pnpm exec checkly deploy` | Deploy monitors |
| `ENVIRONMENT_URL=https://… pnpm exec checkly test` | Point at a deploy |

Local health assert without Checkly:

```bash
pnpm health
pnpm demo:check
curl -i 'http://127.0.0.1:3000/api/health?force=down'  # expect 503
```

Defaults assume fixture Demo Mode (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`).

Docs map: [`docs/INDEX.md`](../docs/INDEX.md).
