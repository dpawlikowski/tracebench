# Tracebench — Awwwards pass v3 (remaining gaps)

**Status:** Shipped (2026-09-20). Closes leftover craft after [DESIGN_AWARDS_PASS_V2.md](./DESIGN_AWARDS_PASS_V2.md).

## Direction (unchanged)
Phosphor Instrument — canvas `#09090b`, accent `#B4F03C` sparse, Linear hairlines, 4px grid. Story = 3-act film.

## Gaps closed

### 1. Story deeper scrub
- `ScrollScene` `mode="scrub"` wired on blind-spot, what-breaks, answer, outcomes, proof, start (not only sticky how-teams).
- New `ParallaxLayer` for modest depth on copy vs proof cards.
- CPA remains timer auto-assemble only (never page-scroll progress).
- Sticky how-teams frame scrub unchanged; no empty scroll voids.
- `prefers-reduced-motion` → static sections (no opacity/y/parallax).

### 2. Timeline + approvals
- ShapeOfRun / Timeline / ApprovalGate: hairline borders, calm type (no ALL-CAPS noise), denser spacing, sticky Panel headers.
- Run detail sticky decision header matching `.tb-page` / `.tb-title`.

### 3. Evals
- Scorecard table: tracking-tight th, hover rows, sticky thead via `.tb-table-wrap`.

### 4. Dashboards
- Widget shell radius/padding/label chrome only; DnD, −/+, minimize, sparkline clip preserved.

### 5. Command palette + policy matrix
- Instrument list/row/focus states; quieter backdrop; selected row hairline border.
- Policy rows keyboard-focusable with accent ring.

### 6. Holistic
- `.tb-instrument-row` utility; ChildRuns / MetricsRail loading chrome aligned to tokens.
