export const tokens = {
  color: {
    bg: "#09090b",
    bgElevated: "#111113",
    bgHover: "#18181b",
    bgSunken: "#050506",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
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
    modal: "0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.14)",
  },
  motion: {
    fast: "120ms",
    base: "160ms",
    slow: "180ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type Tokens = typeof tokens;
