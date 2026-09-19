# Perf & a11y budget (Stage D3 / E2 re-measure)

**Status:** Measured under Demo Mode on **2026-09-20** (CEST). Docs map: [INDEX.md](./INDEX.md).

**Targets (mobile):** Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 90

## How to measure

```bash
pnpm dev
# Stable Chrome flags (box / CI):
pnpm dlx lighthouse http://127.0.0.1:3000/ \
  --only-categories=performance,accessibility,best-practices \
  --form-factor=mobile \
  --throttling-method=provided \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"
# Key routes: /  /runs  /runs/run_live_approve  /story
```

`--throttling-method=provided` is required in this shared lab (CPU/network limits make default *simulate* throttling unrealistically harsh). Re-run with default simulated throttling on a laptop before publishing Vercel numbers.

Raw JSON: `docs/lighthouse/{home,runs,run_live_approve,story}.json` · summary `docs/lighthouse/scores.json`.

Storybook a11y: `@storybook/addon-a11y` on ApprovalGate / Timeline / Modal (`pnpm test:storybook`). Public Storybook: https://dpawlikowski.github.io/tracebench/

## Actuals (2026-09-20, mobile, Demo Mode, throttling=provided)

| Route | Performance | Accessibility | Best Practices | vs target |
|-------|-------------|----------------|----------------|-----------|
| `/` | **88** | **98** | **96** | ⚠ perf / ✅ / ✅ |
| `/runs` | **88** | **98** | **96** | ⚠ perf / ✅ / ✅ |
| `/runs/run_live_approve` | **77** | **95** | **96** | ⚠ perf / ✅ / ✅ |
| `/story` | **82** | **98** | **96** | ⚠ perf / ✅ / ✅ |

### Notes

- Accessibility clears the bar on all measured routes (run detail improved to **95**).
- Performance sits under the ≥90 target after Phosphor Instrument / marketing v2 (CSS 3D Control Plane Assembly on `/` + `/story`, denser run chrome). Follow-ups: defer Joyride + ShapeOfRun/sparklines, tighter dynamic imports on run detail.
- Scores are **real** lab numbers only — do not invent replacements. Optional follow-up: re-measure against https://tracebench.vercel.app on a laptop with default simulate throttling.
- Phosphor (`#B8FF3D` on dark) prefers accent-on-fill with dark fg for contrast.

## Script

```bash
for pair in "home:/" "runs:/runs" "run_live_approve:/runs/run_live_approve" "story:/story"; do
  name="${pair%%:*}"; path="${pair#*:}"
  pnpm dlx lighthouse "http://127.0.0.1:3000$path" \
    --only-categories=performance,accessibility,best-practices \
    --form-factor=mobile \
    --throttling-method=provided \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
    --output=json --output-path="docs/lighthouse/${name}.json"
done
```
