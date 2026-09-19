"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@tracebench/ui";

export function HelpTip({
  title,
  body,
  href,
  className,
}: {
  title: string;
  body: string;
  href: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Help: ${title}`}
        data-testid="help-tip"
        onClick={() => setOpen((o) => !o)}
        className="tb-interactive inline-flex h-5 w-5 items-center justify-center rounded-full border border-tb-border text-[11px] font-semibold text-tb-text-dim hover:border-tb-accent/50 hover:text-tb-text"
      >
        ?
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={title}
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[280px] rounded-md border border-tb-border-strong bg-tb-bg-elevated p-3 shadow-none"
        >
          <div className="mb-1 text-[13px] font-semibold text-tb-text">{title}</div>
          <p className="m-0 mb-2 text-[12px] leading-relaxed text-tb-text-muted">{body}</p>
          <Link
            href={href}
            className="text-[12px] font-medium text-tb-accent no-underline hover:underline"
            onClick={() => setOpen(false)}
          >
            Read more in Help →
          </Link>
        </div>
      )}
    </div>
  );
}
