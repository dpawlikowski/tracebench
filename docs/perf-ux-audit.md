# Perf + UX audit (2026-09-19 → addenda through 2026-09-20)

Docs map: [INDEX.md](./INDEX.md).

Scope: Stage C polish aftermath — dashboards / graph / FAQ / Demo Mode. Later: Phosphor Instrument, marketing v2, Ops Trace. Fixtures only.

## Critical fixes (before → after)

| Issue | Before | After |
|-------|--------|-------|
| `/dashboards` HTTP 500 / client crash | `fleetSeries` imported from `@/lib/metrics/series` (not exported); WidthProvider SSR/snapshot noise | Import from `@/lib/dashboards/metrics`; board loaded via `DashboardPageClient` (`next/dynamic`, `ssr: false`) |
| `/runs/run_pipeline_ops/graph` Application error | `useQueries` → new array every render → `useMemo(children)` churn → `useEffect(setNodes/setEdges)` → **Maximum update depth exceeded** | Controlled React Flow nodes/edges (`useMemo` only); children keyed by `status:dataUpdatedAt:id`; no `useNodesState` sync effect |
| `getServerSnapshot` infinite-loop warning | `usePrefs` / `read()` returned fresh `{}` on server | Stable `SERVER_PREFS` singleton for SSR snapshot + `read()` |

## Performance

| Area | Finding | Status |
|------|---------|--------|
| Route code-splitting | Story, graph, dashboards, cmdk, Joyride, ShapeOfRun, Sparkline, Ops already `next/dynamic` where needed | Keep |
| Charts | uPlot sparkline rAF-throttled `setData`; recharts only on `/dashboards` (board is client-only) | OK for Demo Mode |
| Replay | Sparkline pending+rAF; avoid setState-per-event on graph | Graph loop fixed |
| `/` `/story` | Control Plane Assembly = CSS 3D; optional Canvas lattice; no Three.js; `prefers-reduced-motion` | Shipped marketing v2 |
| Fonts | Geist via `next/font` (Phosphor Instrument) | Shipped — IBM Plex no longer brand sans |
| React dupes | Single `react` under `apps/web/node_modules` | OK |

### Suggested follow-ups (non-blocking)

1. Split recharts into `widgets-charts.tsx` + dynamic import if board TTI regresses.
2. Re-measure Lighthouse after Phosphor/marketing before Stage E publish (keep documented scores until then).
3. Record `pnpm --filter @tracebench/web build` route sizes in CI artifact once.

## UX

| Area | Finding | Status |
|------|---------|--------|
| Keyboard | ⌘K, Replay, Esc/⌘Enter approve; Logs F follow + `/` search | Present |
| Focus visible | Interactive controls use focus rings / tb tokens (Phosphor accent) | Keep regression-tested in Storybook a11y |
| Empty/loading/error | Widget shell spinner + empty; dashboards loading gate; runs list skeletons | OK |
| Demo Mode blank | Sparklines pad ≥8 pts; FAQ screenshots from fixtures | OK |
| Deep-links | KPI tiles → `/runs?status=awaiting_approval`, `/evals`, `/runs/run_pipeline_ops` | Wired |
| FAQ | `/help/faq` with screenshots; linked from Help hub, ⌘K, Demo badge, landing | Shipped |
| Ops | `/ops` + run-detail Ops Trace panel | Shipped |

## UI

| Area | Finding | Status |
|------|---------|--------|
| Density | Comfort/dense prefs via stable `useSyncExternalStore` | Fixed snapshot |
| Borders / contrast | Phosphor tokens (`tb-border`, `#B8FF3D` accent, hairlines, radius 2–6) | Design System v2 |
| Sticky | Log level chips sticky; metrics rail sticky | Present |
| DnD vs click | Dashboard drag handle `.tb-dash-drag` only; KPI `Link` inside tile | Present |
| A2A chips | Sequence strip + mono pills with stable agent colors + text | Present |

## Verify

```bash
pnpm dev
# Graph must not white-screen:
open /runs/run_pipeline_ops/graph
# Boards must render widgets:
open /dashboards
# Ops Trace:
open /ops
# FAQ screenshots:
open /help/faq
pnpm demo:check   # expects demoMode.kind=demo
pnpm test:e2e     # critical path
```

## Residual risk

- React Grid Layout + React 19: keep board client-only.
- Expanded graph mode with many event nodes: still SVG/DOM (no WebGL); OK for fixtures.
- Run-detail Lighthouse mobile perf/a11y slightly under budget (see `perf-a11y-budget.md`) — do not invent replacement scores.

---

## Addendum — Phosphor + marketing + Ops (2026-09-20)

| Route | Notes |
|-------|-------|
| `/` | Control Plane Assembly; Demo badge; grain respects reduced-motion |
| `/story` | Dynamic `StoryExperience`; motion tokens; reduced-motion → static |
| `/runs` | List skeletons; nuqs filters; density prefs |
| `/runs/[id]` | HITL modal; children via `useChildRuns`; Ops Trace panel |
| `/runs/[id]/graph` | Dumb `RunGraphView({ run, children })`; controlled RF nodes/edges |
| `/evals` | Gate + intentional fails linked from failure gallery |
| `/dashboards` | `useRunsDetails` → widgets get `AgentRun[]` |
| `/ops` | Fixture span summaries (`OPS_TELEMETRY=fixture`) |
| `/help/*` | Tour restart; FAQ; architecture link |
| `/policy` | Mock matrix non-empty |
| `/architecture` | Tradeoff page |

### Perf hygiene

- Keep `next/dynamic` for graph, story, dashboards, cmdk, Joyride, ShapeOfRun, Sparkline
- Query unwrapping centralized in hooks (`useChildRuns`, `useRunsDetails`) — **UI does not unwrap Query**
- No Three.js on marketing critical path

### Stage E

GitHub + Pages Storybook shipped. **Vercel deploy still pending.**
