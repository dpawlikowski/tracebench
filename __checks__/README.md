# Checkly Monitoring-as-Code (optional)

Scaffold only — **no Checkly account required** to keep the repo valid.

## Target URL

Checks resolve the base URL in this order:

1. `ENVIRONMENT_URL` (preferred — Checkly / CI)
2. `CHECKLY_BASE_URL` (alias)
3. `http://127.0.0.1:3000` (local smoke)

**Production Demo Mode app:** https://tracebench.vercel.app

```bash
# Against Vercel (recommended once Checkly account exists)
ENVIRONMENT_URL=https://tracebench.vercel.app pnpm exec checkly test
ENVIRONMENT_URL=https://tracebench.vercel.app pnpm exec checkly deploy

# Local smoke (pnpm dev must be up)
pnpm health
pnpm demo:check
curl -i 'http://127.0.0.1:3000/api/health?force=down'  # expect 503
ENVIRONMENT_URL=http://127.0.0.1:3000 pnpm exec checkly test
```

| Command | Purpose |
|---------|---------|
| `pnpm exec checkly test` | Dry-run checks (needs `checkly login`) |
| `pnpm exec checkly deploy` | Deploy monitors |
| `ENVIRONMENT_URL=https://tracebench.vercel.app pnpm exec checkly test` | Point at prod |

## Honesty

- Full app prod = **Vercel** (`https://tracebench.vercel.app`). Checkly should target that URL.
- **GitHub Pages = Storybook only** (`https://dpawlikowski.github.io/tracebench/`). Do **not** point `__checks__` at Pages and pretend they cover the product (no `/api/health`, no HITL SSE).
- Defaults assume fixture Demo Mode (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`).

Files: `health.check.ts` (API), `homepage.spec.ts` (browser smoke). Config: `../checkly.config.ts`.

Docs map: [`docs/INDEX.md`](../docs/INDEX.md).
