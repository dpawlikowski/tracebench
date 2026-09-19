export const tokens = {
  color: {
    bg: "#070708",
    bgElevated: "#0E0E10",
    bgHover: "#141416",
    bgSunken: "#050505",
    border: "rgba(255,255,255,0.06)",
    borderStrong: "rgba(255,255,255,0.12)",
    text: "#F4F4F5",
    textMuted: "#A1A1AA",
    textDim: "#63636B",
    accent: "#B8FF3D",
    accentFg: "#0A0A0A",
    accentSoft: "rgba(184,255,61,0.12)",
    success: "#4ADE80",
    successSoft: "rgba(74,222,128,0.15)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.15)",
    danger: "#FF5C5C",
    dangerSoft: "rgba(255,92,92,0.15)",
    riskLow: "#B8FF3D",
    riskLowSoft: "rgba(184,255,61,0.12)",
    riskMedium: "#FBBF24",
    riskMediumSoft: "rgba(251,191,36,0.15)",
    riskHigh: "#FF5C5C",
    riskHighSoft: "rgba(255,92,92,0.15)",
  },
  radius: {
    sm: "2px",
    md: "4px",
    lg: "6px",
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
    modal: "0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.12)",
  },
  motion: {
    fast: "120ms",
    base: "160ms",
    slow: "180ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type Tokens = typeof tokens;
