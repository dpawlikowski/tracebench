"use client";

import type { ReactNode } from "react";
import { cn } from "@tracebench/ui";
import { useReducedMotion } from "@/lib/prefs";

export function MaskReveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={cn(!reduced && "tb-mask-reveal", className)}
      style={reduced ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
