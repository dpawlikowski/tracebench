# Checkly Monitoring-as-Code (optional)

Scaffold only — **no Checkly account required** to keep the repo valid.

| Command | Purpose |
|---------|---------|
| `pnpm exec checkly test` | Dry-run checks (needs `checkly login`) |
| `pnpm exec checkly deploy` | Deploy monitors |
| `ENVIRONMENT_URL=https://… pnpm exec checkly test` | Point at a deploy |

Local health assert without Checkly:

```bash
pnpm health
curl -i 'http://127.0.0.1:3000/api/health?force=down'  # expect 503
```
