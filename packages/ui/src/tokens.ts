export const tokens = {
  color: {
    bg: "#0b0f14",
    bgElevated: "#121821",
    bgHover: "#1a2330",
    border: "#243044",
    borderStrong: "#334155",
    text: "#e8eef7",
    textMuted: "#8b9bb4",
    textDim: "#5c6b82",
    accent: "#5b9fd4",
    accentSoft: "rgba(91, 159, 212, 0.15)",
    success: "#3dba7e",
    successSoft: "rgba(61, 186, 126, 0.15)",
    warning: "#d4a017",
    warningSoft: "rgba(212, 160, 23, 0.15)",
    danger: "#e05d5d",
    dangerSoft: "rgba(224, 93, 93, 0.15)",
    riskLow: "#5b9fd4",
    riskLowSoft: "rgba(91, 159, 212, 0.15)",
    riskMedium: "#d4a017",
    riskMediumSoft: "rgba(212, 160, 23, 0.15)",
    riskHigh: "#e05d5d",
    riskHighSoft: "rgba(224, 93, 93, 0.15)",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    full: "999px",
  },
  font: {
    sans: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
    mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
  },
  shadow: {
    panel: "0 8px 32px rgba(0,0,0,0.35)",
    modal: "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(36, 48, 68, 0.8)",
  },
} as const;

export type Tokens = typeof tokens;
