# Tracebench Design System v2 — Phosphor Instrument

**Status:** Shipped (2026-09-20). Ops + marketing chrome use these tokens.

**Shipped summary:** Near-black canvas, phosphor accent `#B8FF3D`, Geist / Geist Mono, hairline borders, radius 2–6px, shared-edge tile grids. No soft-blue shadcn default, no glass panels, no diffuse card shadows. Marketing motion lives in [MARKETING_MOTION_V2.md](./MARKETING_MOTION_V2.md) — this doc owns tokens and ops chrome principles only.

## Problem (solved)

Pre-v2 UI read as generic dark SaaS: soft blue `#5b9fd4` + large radii + soft shadows. Template energy, not Awwwards / senior-portfolio signal.

## Direction (locked): Phosphor Instrument

DNA: Finout (Awwwards HM) + Factory war-room + Linear/Vercel craft + editorial marketing only on `/` and `/story`.

**Not:** glassmorphism everywhere, purple AI gradients, soft blue “every shadcn”, chubby cards with drop shadows.

## Principles

1. Near-black canvas; depth via surface steps + hairlines — **no diffuse shadows** on panels.
2. One accent used surgically (~3% of pixels): phosphor lime for live / primary / focus.
3. Typography is the brand: tight tracking display, mono for telemetry.
4. Shared-edge tile grids (collapsed gutters) > floating cards.
5. Motion: 120–180ms ease-out; honor `prefers-reduced-motion`.

## Tokens

### Color

| Token | Value | Use |
|-------|-------|-----|
| `--tb-bg` | `#070708` | App canvas |
| `--tb-bg-elevated` | `#0E0E10` | Panels / tiles |
| `--tb-bg-hover` | `#141416` | Hover / selected |
| `--tb-bg-sunken` | `#050505` | Inset wells, code |
| `--tb-border` | `rgba(255,255,255,0.06)` | Hairline |
| `--tb-border-strong` | `rgba(255,255,255,0.12)` | Active / focus ring base |
| `--tb-text` | `#F4F4F5` | Primary |
| `--tb-text-muted` | `#A1A1AA` | Secondary |
| `--tb-text-dim` | `#63636B` | Tertiary / labels |
| `--tb-accent` | `#B8FF3D` | Phosphor — CTA, live, focus |
| `--tb-accent-fg` | `#0A0A0A` | Text on accent fills |
| `--tb-accent-soft` | `rgba(184,255,61,0.12)` | Soft chip / glow wash |
| `--tb-success` | `#4ADE80` | Pass |
| `--tb-warning` | `#FBBF24` | Warn |
| `--tb-danger` | `#FF5C5C` | Fail / high risk |
| Risk low/med/high | accent soft / warning / danger | Keep semantic |

### Typography

- **Sans:** `Geist` → `Inter` → system-ui (UI + marketing body)
- **Mono:** `Geist Mono` → `IBM Plex Mono` → ui-monospace (IDs, timestamps, metrics, log lines, kbd)
- Display (landing/story H1): Geist 48–72px, weight 500–600, tracking `-0.04em`
- Section label: Geist Mono 11px uppercase, tracking `0.08em`, color dim
- Metric value: Geist Mono or tabular-nums Geist 28–36px, tracking tight
- Body: 14px / 1.5; dense mode 13px

Load via `next/font` (geist) — self-host, no layout flash.

### Radius

| Token | Value |
|-------|-------|
| sm | `2px` |
| md | `4px` |
| lg | `6px` |
| full | pills for status only |

### Spacing (8pt)

Panel pad `16–20px`; section gap `24px`; tile gap `0` with shared borders (1px grid) OR `1px` gap showing canvas.

### Elevation

- Panels: `background: elevated; border: 1px solid border` — **no box-shadow**
- Modal: optional `0 0 0 1px border-strong` + soft ambient `0 24px 80px rgba(0,0,0,0.65)` only
- Focus: `outline: 1px solid accent; outline-offset: 2px`

### Background atmosphere (marketing + subtle app)

- Optional 2–3% noise SVG or CSS noise on canvas
- Faint 48px grid (`linear-gradient` hairlines) on landing/story only
- No colorful mesh blobs behind ops chrome

### Surfaces restyled

AppShell, sidebar, topbar, Card/Panel/Stat tiles, buttons, badges/risk chips, tables/run rows, timeline/logs (mono), dashboard widgets (shared-edge), landing + `/story`, Ops Trace / `/ops`, command palette, modals, toasts.

### Anti-goals

- Do not reintroduce soft blue as brand accent
- Do not round everything to 12px+
- Do not add glass blur on every card
- Do not break Demo Mode / a11y contrast (prefer accent on fills with dark fg)

## Done when — ✅

- Tokens in `packages/ui` + `apps/web/app/globals.css`
- Geist wired; UI no longer “default shadcn blue dark”
- Shell + tiles + landing/story visibly Phosphor Instrument
- `prefers-reduced-motion` respected; e2e smoke green
