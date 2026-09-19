# Tracebench — Awwwards pass v2 (creative direction)

**Status:** Executing / shipped craft (2026-09-20). Phosphor Instrument locked; `/story` = 3-act film.

## Inspirations (deconstructed, not cloned)
1. **Inkwell (Awwwards)** — three-act scroll narrative; each section = scene; cinematic pacing; pathfinder orients without breaking the story; restraint over spectacle.
2. **Linear marketing/product** — near-black canvas, surface ladder, hairline borders, single accent used sparingly, aggressive display tracking, 4px spacing grid, motion as feedback (120–220ms).
3. **Vercel / Raycast** — product chrome as instrument; density without clutter; crisp focus rings; keyboard-first feel.
4. **Synapse / Suridata** — problem→solution contrast; product-in-frame; trust without fluff.

## Tracebench adaptation (Phosphor Instrument)
- Canvas: `#09090b` (zinc black, not pure `#000`)
- Surfaces: elevated ladder `#111113` / hover `#18181b` / sunken `#050506`
- Borders: hairline `#27272a` · strong `#3f3f46` (solid zinc — not neon)
- Accent: phosphor `#B4F03C` — punctuation only (CTA, active, armed). Never neon flood.
- Type: Geist / Inter-class sans; display tracking −0.04em…−0.02em; mono only for IDs/metrics/code
- Space: 4px base → 8/12/16/24/32/48/64/96 (`--tb-space-*`)
- Radius: 4 controls · 6–8 cards · no playful pills unless chip
- Motion: scroll-linked storytelling on `/story`; elsewhere micro-feedback only; honor `prefers-reduced-motion`

## Token changelog (v2 lock)
| Token | Before (v1 docs) | After (v2) |
|-------|------------------|------------|
| `--tb-bg` | `#070708` | `#09090b` |
| `--tb-border` | `rgba(255,255,255,0.06–0.08)` | `#27272a` |
| `--tb-border-strong` | `rgba(255,255,255,0.12–0.14)` | `#3f3f46` |
| `--tb-accent` | `#B8FF3D` | `#B4F03C` |
| Radius | 2/4/6 | **4/6/8** |
| Space scale | ad-hoc | `--tb-space-1…24` (4→96px) |
| Type | display clamp only | `--tb-type-display`, `-display-sm`, title/body/meta/mono |

Sources of truth: `packages/ui/src/tokens.ts`, `packages/ui/src/styles.css`, `apps/web/app/globals.css`.

## Story = film (priority)
**Acts**
- **I Blind spot** — hero + blind-spot + what-breaks
- **II Answer** — control plane pillars + outcomes
- **III Practice** — how-teams sticky scrub + proof + start

**Scroll choreography inventory**
| Moment | Technique | File |
|--------|-----------|------|
| Hero display | ClipReveal (y+clip mask) | `ScrollScene.tsx` |
| Section enter | StaggerBlock fade/y once | `ScrollScene.tsx` |
| Act dividers | ActBanner mono + hairline | `ScrollScene.tsx` |
| Pathfinder | Act-grouped chapter index + % | `StoryProgressRail.tsx` |
| Sticky how-teams | Frame scrub via section scroll; sticky height = frame count; ←/→ | `StoryExperience.tsx` |
| Frame copy/image | AnimatePresence + clip-path | `StoryExperience.tsx` |
| Metrics | MetricCounter on enter | `MetricCounter.tsx` |
| CPA hero/answer | Auto-assemble timers only — **never page scroll** (5c9593a) | `ControlPlaneAssembly.tsx` |
| Reduced motion | Static composed; no clip/scrub | prefs + guards |

**Constraints kept:** Demo Mode / data-testid / fixtures; flat 2D CPA; sticky height by frame count; zero empty voids.

## Whole product
Same tokens on Overview (problem→solution contrast) + AppShell instrument chrome + runs/evals/boards/ops/policy/help/architecture via `.tb-page` / `.tb-title` / `.tb-subtitle`.

## Research applied
- Award sites win on **one narrative device + pathfinder**, not motion everywhere.
- Linear/Vercel: hairlines + sparse accent + tight display > glow spam.
- Synapse: explicit problem/solution split before product proof.
- Windows Chrome: no `preserve-3d` on CPA.
