# UX audit polish (2026-09-19)

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
| Chrome | Occasional blur | Modal backdrop blur removed; quiet solid dim |
