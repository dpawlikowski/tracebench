import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export function Card({
  children,
  style,
  padding = 16,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-tb-border bg-tb-bg-elevated shadow-[var(--tb-shadow-panel)]",
        className,
      )}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
