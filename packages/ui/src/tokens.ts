export const tokens = {
  color: {
    bg: "#09090b",
    bgElevated: "#111113",
    bgHover: "#18181b",
    bgSunken: "#050506",
    /** Hairline — zinc-800 solid (Linear-class on dark canvas) */
    border: "#27272a",
    /** Active / focus ring base */
    borderStrong: "#3f3f46",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    textDim: "#71717A",
    accent: "#B4F03C",
    accentFg: "#09090b",
    accentSoft: "rgba(180,240,60,0.14)",
    success: "#4ADE80",
    successSoft: "rgba(74,222,128,0.15)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.15)",
    danger: "#FF5C5C",
    dangerSoft: "rgba(255,92,92,0.15)",
    riskLow: "#B4F03C",
    riskLowSoft: "rgba(180,240,60,0.14)",
    riskMedium: "#FBBF24",
    riskMediumSoft: "rgba(251,191,36,0.15)",
    riskHigh: "#FF5C5C",
    riskHighSoft: "rgba(255,92,92,0.15)",
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    full: "999px",
  },
  font: {
    sans: '"Geist", "Inter", system-ui, sans-serif',
    mono: '"Geist Mono", "IBM Plex Mono", ui-monospace, monospace',
  },
  shadow: {
    /** Panels: no diffuse shadow — depth via surface + hairline only */
    panel: "none",
    /** Modals only: ambient dark + hairline ring */
    modal: "0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px #3f3f46",
  },
  motion: {
    fast: "120ms",
    base: "160ms",
    slow: "220ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  /** 4px base → 8/12/16/24/32/48/64/96 */
  space: {
    1: "0.25rem", // 4
    2: "0.5rem", // 8
    3: "0.75rem", // 12
    4: "1rem", // 16
    5: "1.25rem", // 20
    6: "1.5rem", // 24
    8: "2rem", // 32
    10: "2.5rem", // 40
    12: "3rem", // 48
    16: "4rem", // 64
    24: "6rem", // 96
  },
  type: {
    display: "clamp(2.125rem, 4.5vw, 3.75rem)",
    displaySm: "clamp(1.5rem, 3vw, 2.25rem)",
    title: "1.375rem",
    body: "0.9375rem",
    bodySm: "0.8125rem",
    meta: "0.75rem",
    mono: "0.8125rem",
    label: "0.75rem",
  },
} as const;

export type Tokens = typeof tokens;
