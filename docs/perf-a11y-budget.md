# Perf & a11y budget (Stage D3)

**Status:** Measured under Demo Mode. Docs map: [INDEX.md](./INDEX.md). Phosphor Instrument / marketing v2 shipped afterward — **do not invent new Lighthouse numbers**; re-measure before publishing Stage E scores.

**Targets (mobile):** Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 90

## How to measure

```bash
pnpm dev
# Chrome / CI:
pnpm dlx lighthouse http://127.0.0.1:3000/ \
  --only-categories=performance,accessibility,best-practices \
  --form-factor=mobile \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"
# Key routes: /  /runs  /runs/run_live_approve  /evals  /dashboards  /ops  /story
```

Raw JSON: `docs/lighthouse/{home,runs,run_live_approve}.json` · summary `docs/lighthouse/scores.json`.

Storybook a11y: `@storybook/addon-a11y` on ApprovalGate / Timeline / Modal (`pnpm test:storybook`). Public Storybook: https://dpawlikowski.github.io/tracebench/

## Actuals (2026-09-19, mobile, Demo Mode, throttling=provided)

| Route | Performance | Accessibility | Best Practices | vs target |
|-------|-------------|----------------|----------------|-----------|
| `/` | **95** | **98** | **96** | ✅ / ✅ / ✅ |
| `/runs` | **100** | **98** | **96** | ✅ / ✅ / ✅ |
| `/runs/run_live_approve` | **82** | **94** | **96** | ⚠ perf / ⚠ a11y / ✅ |

### Notes

- Landing + runs list clear the bar under Demo Mode (fixtures, no network on critical path).
- Run detail is heavier (timeline + metrics + approval chrome). Follow-ups: tighter dynamic import of ShapeOfRun/sparklines, defer Joyride, audit contrast on muted labels (a11y 94 → ≥95).
- Scores recorded with `--throttling-method=provided` in this environment (CPU/network lab limits). Re-run with default simulated throttling on a laptop before Stage E Vercel publish numbers.
- Phosphor (`#B8FF3D` on dark) prefers accent-on-fill with dark fg for contrast.

## Script

```bash
# scripts/lighthouse-budget.mjs can be added later; for now:
for path in / /runs /runs/run_live_approve; do
  pnpm dlx lighthouse "http://127.0.0.1:3000$path" \
    --only-categories=performance,accessibility,best-practices \
    --form-factor=mobile \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
    --output=json --output-path="docs/lighthouse/$(echo $path | tr / _).json"
done
```
