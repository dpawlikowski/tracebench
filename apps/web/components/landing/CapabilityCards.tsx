"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@tracebench/ui";
import { useReducedMotion } from "@/lib/prefs";

export type Capability = {
  t: string;
  d: string;
  detail: string;
  href: string;
  cta: string;
};

type Props = {
  items: readonly Capability[];
};

/** Expand-on-activate capability tiles — teach a surface, then deep-link into Demo Mode. */
export function CapabilityCards({ items }: Props) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="tb-tile-grid grid-cols-1 sm:grid-cols-3" data-testid="landing-capabilities">
      {items.map((c) => {
        const open = active === c.t;
        return (
          <div
            key={c.t}
            role="button"
            tabIndex={0}
            aria-expanded={open}
            data-testid={`landing-capability-${c.t.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => setActive(open ? null : c.t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActive(open ? null : c.t);
              }
            }}
            className={cn(
              "group relative flex cursor-pointer flex-col p-5 text-left outline-none transition-[background-color,transform,box-shadow] duration-150",
              "hover:bg-tb-bg-hover focus-visible:bg-tb-bg-hover",
              open && "bg-tb-bg-hover",
              !reduced && "hover:-translate-y-0.5",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="m-0 text-[15px] font-semibold tracking-tight">{c.t}</h2>
              <span
                className={cn(
                  "mt-0.5 text-[11px] tabular-nums text-tb-text-dim transition-colors",
                  open ? "text-tb-accent" : "group-hover:text-tb-text-muted",
                )}
                aria-hidden
              >
                {open ? "−" : "+"}
              </span>
            </div>
            <p className="mb-0 mt-2 text-[13px] leading-relaxed text-tb-text-muted">{c.d}</p>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
              style={{ transitionDuration: reduced ? "0ms" : undefined }}
            >
              <div className="overflow-hidden">
                <p className="mb-0 mt-3 border-t border-tb-border pt-3 text-[12px] leading-relaxed text-tb-text-muted">
                  {c.detail}
                </p>
                <Link
                  href={c.href}
                  prefetch
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex text-[12px] font-medium text-tb-accent no-underline hover:underline"
                >
                  {c.cta} →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
