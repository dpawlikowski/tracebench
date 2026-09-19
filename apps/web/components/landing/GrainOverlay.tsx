"use client";

import { useReducedMotion } from "@/lib/prefs";

/**
 * Subtle ambient film grain — pure CSS (no Three.js / WebGL).
 * When prefers-reduced-motion: static (no animated noise).
 */
export function GrainOverlay() {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden
      data-testid="grain-overlay"
      className={reduced ? "tb-grain tb-grain-static" : "tb-grain tb-grain-animated"}
    />
  );
}
