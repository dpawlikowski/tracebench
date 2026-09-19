# GitHub Pages

## What publishes

**Storybook** (component kit + MSW stories) → `https://dpawlikowski.github.io/tracebench/`

Built by `.github/workflows/github-pages.yml` on every push to `main`.

## What does *not* run on Pages

The full Next app (Demo Mode APIs, SSE, HITL) needs a Node host — use **Vercel** or `pnpm build && pnpm start`.

## Local

```bash
pnpm build:storybook          # apps/web/storybook-static
pnpm pages:preview            # optional static preview of that folder
```

Set `STORYBOOK_BASE_PATH=/tracebench/` when building for project Pages (CI does this).
