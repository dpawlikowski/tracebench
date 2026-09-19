# UX audit polish (2026-09-19)

Historical polish log (pre–Phosphor). Visual system since then: **Phosphor Instrument** — see `DESIGN_SYSTEM_V2.md` (near-black + `#B8FF3D`, Geist, hairlines, radius 2–6). Soft-blue / blur chrome called out below is **superseded**.

| Gap | Before | After |
|-----|--------|-------|
| Toasts | Silent approve/deny/replay | `sonner` toasts + View audit action; max 3; reduced-motion safe |
| Press/hover | Brightness only | `.tb-interactive` 100–120ms + `active:scale-[0.98]` (no bounce) |
| Keyboard chips | Hidden in modal footer | `Kbd` next to Replay / Approve; ⌘K footer documents Esc/⌘Enter/R |
| Focus restore | Modal yes; palette no | Palette restores opener; Esc closes consistently |
| Skeletons | Spinner only | `SkeletonTableRows` geometry; static if `prefers-reduced-motion` |
| Truncation | Clamp only | `Tooltip` on mono args + risk context |
| Replay UX | Label flip | Pressed state + “▶ streaming · speed 1.4×” affordance |
| Live regions | Visual microcopy | `aria-live="polite"` on shell + run decision strips |
| Chrome | Occasional blur | Modal backdrop blur removed; quiet solid dim (Phosphor: no glass on panels) |

See also: [DESIGN_SYSTEM_V2.md](./DESIGN_SYSTEM_V2.md) · [perf-ux-audit.md](./perf-ux-audit.md) · [INDEX.md](./INDEX.md)
