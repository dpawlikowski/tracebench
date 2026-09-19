# Marketing + Motion v2 — Boutique Agency Rebuild

**Status:** Shipped (2026-09-20). `/` and `/story` use Phosphor Instrument + Control Plane Assembly.

**Shipped summary:** Boutique `/` + `/story` rebuild. Signature device = **Control Plane Assembly** (CSS 3D layers + optional Canvas phosphor lattice ≤120 particles; **no Three.js**). Ops routes stay dense — marketing is editorial only. Tokens and ops chrome: [DESIGN_SYSTEM_V2.md](./DESIGN_SYSTEM_V2.md). Lighthouse actuals: [perf-a11y-budget.md](./perf-a11y-budget.md) (do not invent new scores).

## Goal

Rebuild `/` and `/story` as an Awwwards-grade boutique agency experience. Ops density elsewhere; marketing is cinematic and performant.

## Research takeaways (2025–26)

- Award sites win on **scroll narrative + one signature device**, not 3D everywhere.
- Cheat where possible (CSS 3D / canvas frames); **cap DPR ≤ 1.5**, pause offscreen, adaptive quality, `prefers-reduced-motion` = no canvas enhancement.
- Pure CSS `perspective` + `translateZ` can feel “3D” with ~0 JS payload.
- Frame-scrub on Canvas beats swapping `<img>` sources when scroll is fast.

## Signature device

### “Control Plane Assembly” (hero + story beat)

A procedural instrument (approval gate + timeline spine + agent nodes) that assembles in 3D space on load / scroll:

1. **Primary (default):** CSS 3D (`preserve-3d`, `rotateX/Y`, staggered `translateZ`) + Motion — GPU compositor, no Three.js.
2. **Enhancement (desktop, fine pointer, no reduced-motion):** tiny Canvas 2D phosphor lattice (≤120 particles, DPR clamp 1.5, pause when offscreen). Add Three.js/R3F only if CSS fails the look.
3. Metaphor: chaos points → lattice “control plane” → phosphor accent on HITL node.

Implementation: `ControlPlaneAssembly.tsx` + optional `PhosphorLattice.tsx`.

### Other motion

| Moment | Technique |
|--------|-----------|
| Page enter | Staggered mask reveal on display type (clip-path / overflow) |
| Scroll chapters | Sticky stage + progress rail; one active scene |
| Metrics | Count-up in view; tabular nums (**label illustrative** on `/story`) |
| CTAs | Magnetic hover (desktop) 4–8px max; press scale 0.98 |
| Section change | Horizontal wipe / phosphor hairline sweep |
| Cursor | Optional custom ring on `/` `/story` only; off on touch + reduced-motion |

## Information architecture

### `/` — Agency landing

1. Full-bleed hero: oversized display headline + Control Plane Assembly
2. Proof strip: Demo Mode · zero keys · eval gate (mono chips)
3. Three capability panels (shared-edge tiles): Timeline · HITL · Eval
4. One “work” frame: screenshot in CSS 3D tilt that tracks pointer lightly
5. CTA band → Demo Mode run + `/story`

### `/story` — Scroll film

Chapters: Problem (chaos) → Cost → Control plane assembles → Illustrative outcomes → Demo proof → CTA. Sticky progress rail; boutique case narrative (not feature dump). Label metrics **illustrative**.

## Performance budget

- No Three.js on marketing critical path
- Marketing JS extra ≤ ~40KB gzip intent; canvas optional dynamic import
- Pause rAF when tab hidden / out of view
- `prefers-reduced-motion`: static assembled instrument + fade only
- Keep marketing Lighthouse ≥ prior home scores when possible (see `perf-a11y-budget.md`)

## Anti-goals

Purple AI mesh blobs, heavy GLTF scenes, autoplaying video walls, scroll-jacking that breaks a11y, motion on ops chrome that fights density.

## Done when — ✅

`/` and `/story` feel boutique-agency rebuilt; assembly animation ships; reduced-motion OK; Demo CTAs intact; tests green.
