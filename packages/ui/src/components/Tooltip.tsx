"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";

/** Accessible hover/focus tooltip — not color-only; content is in aria-describedby. */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex max-w-full", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex max-w-full min-w-0">
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-[50] w-max max-w-[280px] -translate-x-1/2 rounded-sm border border-tb-border-strong bg-tb-bg-elevated px-2 py-1 text-[11px] leading-snug text-tb-text shadow-none",
            side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
