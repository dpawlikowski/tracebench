# Marketing + Motion v2 — Boutique Agency Rebuild

## Goal
Rebuild `/` and `/story` as an Awwwards-grade boutique agency experience for Tracebench (Phosphor Instrument). Ops routes stay dense; marketing is editorial, cinematic, and performant.

## Research takeaways (2025–26)
- Award sites win on **scroll narrative + one signature device**, not 3D everywhere (WAMOS, More Nutrition, ZERO).
- Performance discipline: cheat where possible (CSS 3D / canvas frames), real WebGL only if contained; **cap DPR ≤ 1.5**, pause offscreen, adaptive quality, `prefers-reduced-motion` = no WebGL import.
- Pure CSS `perspective` + `translateZ` can feel “3D” with ~0 JS payload (BeeEngine pattern).
- Frame-scrub on Canvas beats swapping `<img>` sources when scroll is fast (More Nutrition).

## Signature device (innovative, light)
### “Control Plane Assembly” (hero + story beat)
A **procedural instrument** (approval gate + timeline spine + agent nodes) that **assembles in 3D space** as you scroll / on load:
1. **Primary path (default):** CSS 3D layers (`preserve-3d`, `rotateX/Y`, staggered `translateZ`) + Motion/Framer — GPU compositor, no Three.js.
2. **Enhancement (desktop, fine pointer, no reduced-motion):** tiny **Canvas 2D** phosphor particle lattice (≤120 particles, DPR clamp 1.5, pause when not intersecting viewport). **Do not add Three.js/R3F** unless CSS path fails the look.
3. Metaphor: chaos points → snap into a lattice “control plane” → phosphor accent lights on HITL node.

### Other motion (premium, not gimmicky)
| Moment | Technique |
|--------|-----------|
| Page enter | Staggered mask reveal on display type (clip-path / overflow) |
| Scroll chapters | Sticky stage + progress rail; one active scene |
| Metrics | Count-up only when in view; tabular nums |
| CTAs | Magnetic hover (desktop) 4–8px max; press scale 0.98 |
| Section change | Horizontal wipe / phosphor hairline sweep |
| Cursor | Optional custom ring on `/` `/story` only; off on touch + reduced-motion |

## Information architecture (rebuild)
### `/` — Agency landing
1. Full-bleed hero: oversized display headline + Control Plane Assembly
2. Proof strip: Demo Mode · zero keys · eval gate (mono chips)
3. Three capability panels (shared-edge tiles): Timeline · HITL · Eval
4. One “work” frame: screenshot in CSS 3D tilt that tracks pointer lightly
5. CTA band → Demo Mode run + `/story`

### `/story` — Scroll film (business)
Chapters: Problem (chaos) → Cost → Control plane assembles → Illustrative outcomes → Demo proof → CTA  
Sticky progress rail; copy as boutique studio case narrative (not feature dump). Label metrics **illustrative**.

## Performance budget
- No Three.js on marketing critical path
- Marketing JS extra ≤ ~40KB gzip intent; canvas optional dynamic import
- Pause rAF when tab hidden / out of view
- `prefers-reduced-motion`: static assembled instrument + fade only
- Keep Lighthouse marketing route ≥ prior home scores when possible

## Anti-goals
Purple AI mesh blobs, heavy GLTF scenes, autoplaying video walls, scroll-jacking that breaks a11y, motion on ops chrome that fights density.

## Done when
`/` and `/story` feel boutique-agency rebuilt; assembly animation ships; reduced-motion OK; Demo CTAs intact; tests green.
