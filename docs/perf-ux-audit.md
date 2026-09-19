# Perf + UX audit (2026-09-19)

Scope: Stage C polish aftermath — dashboards / graph / FAQ / Demo Mode. Fixtures only.

## Critical fixes (before → after)

| Issue | Before | After |
|-------|--------|-------|
| `/dashboards` HTTP 500 / client crash | `fleetSeries` imported from `@/lib/metrics/series` (not exported); WidthProvider SSR/snapshot noise | Import from `@/lib/dashboards/metrics`; board loaded via `DashboardPageClient` (`next/dynamic`, `ssr: false`) |
| `/runs/run_pipeline_ops/graph` Application error | `useQueries` → new array every render → `useMemo(children)` churn → `useEffect(setNodes/setEdges)` → **Maximum update depth exceeded** | Controlled React Flow nodes/edges (`useMemo` only); children keyed by `status:dataUpdatedAt:id`; no `useNodesState` sync effect |
| `getServerSnapshot` infinite-loop warning | `usePrefs` / `read()` returned fresh `{}` on server | Stable `SERVER_PREFS` singleton for SSR snapshot + `read()` |

## Performance

| Area | Finding | Status |
|------|---------|--------|
| Route code-splitting | Story, graph, dashboards, cmdk, Joyride, ShapeOfRun, Sparkline already `next/dynamic` | Keep |
| Charts | uPlot sparkline rAF-throttled `setData`; recharts only on `/dashboards` (board is client-only) | OK for Demo Mode |
| Replay | Sparkline pending+rAF; avoid setState-per-event on graph | Graph loop fixed |
| `/story` scroll | Framer `useScroll` / `useSpring`; respects `useReducedMotion` (parallax → 0, smooth → auto) | OK — no raw non-passive window listeners |
| Fonts | Google Fonts CSS link + preconnect (not `next/font`) | Acceptable; optional follow-up: self-host / `next/font` to drop CSS RTT |
| React dupes | Single `react` under `apps/web/node_modules` | OK |

### Suggested follow-ups (non-blocking)

1. `next/font` for IBM Plex Sans/Mono (remove render-blocking Google CSS).
2. Split recharts into `widgets-charts.tsx` + dynamic import if board TTI regresses.
3. Record `pnpm --filter @tracebench/web build` route sizes in CI artifact once.

## UX

| Area | Finding | Status |
|------|---------|--------|
| Keyboard | ⌘K, Replay, Esc/⌘Enter approve; Logs F follow + `/` search | Present |
| Focus visible | Interactive controls use focus rings / tb tokens | Keep regression-tested in Storybook a11y |
| Empty/loading/error | Widget shell spinner + empty; dashboards loading gate; runs list skeletons | OK |
| Demo Mode blank | Sparklines pad ≥8 pts; FAQ screenshots from fixtures | OK |
| Deep-links | KPI tiles → `/runs?status=awaiting_approval`, `/evals`, `/runs/run_pipeline_ops` | Wired |
| FAQ | `/help/faq` with 8 screenshots; linked from Help hub, ⌘K, Demo badge, landing | Shipped |

## UI

| Area | Finding | Status |
|------|---------|--------|
| Density | Comfort/dense prefs via stable `useSyncExternalStore` | Fixed snapshot |
| Borders / contrast | Dark ops tokens (`tb-border`, accent soft) | Match Stage C |
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
# FAQ screenshots:
open /help/faq
pnpm demo:check   # expects demoMode.kind=demo
pnpm test:e2e     # critical path
```

## Residual risk

- React Grid Layout + React 19: keep board client-only.
- Expanded graph mode with many event nodes: still SVG/DOM (no WebGL); OK for fixtures.

---

## Addendum — final UI/UX/motion polish (pre–Stage E)

Date: 2026-09-19 · Demo Mode fixtures only · no Stage E push.

### Routes walked

| Route | Notes |
|-------|-------|
| `/` | Landing + Demo badge; grain respects reduced-motion |
| `/story` | Dynamic `StoryExperience`; motion tokens; reduced-motion → static |
| `/runs` | List skeletons; nuqs filters; density prefs |
| `/runs/[id]` | HITL modal focus trap; children via `useChildRuns` container |
| `/runs/[id]/graph` | Dumb `RunGraphView({ run, children })`; controlled RF nodes/edges |
| `/evals` | Gate + intentional fails linked from failure gallery |
| `/dashboards` | `useRunsDetails` → widgets get `AgentRun[]` |
| `/help/*` | Tour restart; FAQ screenshots; architecture link |
| `/policy` | Mock matrix non-empty |
| `/architecture` | Tradeoff page |

### Visual / motion

- Shared `lib/motion.ts` tokens (no bounce springs); `prefers-reduced-motion` hard-stops parallax/stagger
- Command palette: pending-open flag survives dynamic-import race (⌘K e2e)
- Empty/loading: panel spinners; Demo Mode never blank on seeded happy path
- Graph/logs/A2A: fixture-derived only; no invented edges

### Perf hygiene

- Keep `next/dynamic` for graph, story, dashboards, cmdk, Joyride, ShapeOfRun, Sparkline
- Query unwrapping centralized in hooks (`useChildRuns`, `useRunsDetails`) — no raw `useQueries` in views

### Residual

- Run-detail Lighthouse mobile perf/a11y slightly under budget (see `perf-a11y-budget.md`)
- Optional: `next/font` self-host to drop Google CSS RTT
