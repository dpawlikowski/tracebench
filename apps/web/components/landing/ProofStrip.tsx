"use client";

import Link from "next/link";
import { cn } from "@tracebench/ui";

export type ProofChip = {
  k: string;
  v: string;
  /** In-page section id (without #) or absolute path */
  target: string;
  kind: "section" | "route";
};

type Props = {
  items: readonly ProofChip[];
};

/** Proof chips that jump to a section or open a demo route — teach trust, then move. */
export function ProofStrip({ items }: Props) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="landing-proof-strip">
      {items.map((p) => {
        const className = cn(
          "inline-flex items-center gap-2 rounded-md border border-tb-border bg-tb-bg-elevated px-2.5 py-1.5 text-[12px] text-tb-text-muted",
          "tb-interactive hover:border-tb-border-strong hover:bg-tb-bg-hover hover:text-tb-text",
          "focus-visible:border-tb-accent/50",
        );
        const body = (
          <>
            <span className="font-medium text-tb-text">{p.k}</span>
            <span className="text-tb-text-dim">·</span>
            <span>{p.v}</span>
          </>
        );
        if (p.kind === "route") {
          return (
            <Link
              key={p.k}
              href={p.target}
              prefetch
              className={cn(className, "no-underline")}
              data-testid={`landing-proof-${p.k.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {body}
            </Link>
          );
        }
        return (
          <button
            key={p.k}
            type="button"
            className={className}
            data-testid={`landing-proof-${p.k.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => {
              const el = document.getElementById(p.target);
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
