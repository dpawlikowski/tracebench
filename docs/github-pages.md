# GitHub Pages

**As of 2026-09-20:** Storybook only — not the full Demo Mode app.

## What publishes

**Storybook** (component kit + MSW stories) → https://dpawlikowski.github.io/tracebench/

Built by `.github/workflows/github-pages.yml` on every push to `main`.

Repo: https://github.com/dpawlikowski/tracebench

## What does *not* run on Pages

The full Next app (Demo Mode APIs, SSE, HITL, Ops Trace) needs a Node host — use **Vercel** (Stage E — still pending) or local:

```bash
pnpm build && pnpm start
# or
pnpm dev
```

## Local scripts

```bash
pnpm build:storybook   # → apps/web/storybook-static
pnpm pages:build       # STORYBOOK_BASE_PATH=/tracebench/ + build:storybook (CI parity)
pnpm pages:preview     # optional static preview of that folder
```

Set `STORYBOOK_BASE_PATH=/tracebench/` when building for project Pages (CI and `pages:build` do this).

## Related

- Design tokens: [DESIGN_SYSTEM_V2.md](./DESIGN_SYSTEM_V2.md)
- Stories-as-tests: [testing.md](./testing.md)
- Docs map: [INDEX.md](./INDEX.md)
