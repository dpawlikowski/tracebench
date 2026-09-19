import { cn } from "../lib/cn";

/** Geometry-preserving skeleton. No shimmer when prefers-reduced-motion. */
export function Skeleton({
  className,
  rows = 1,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} data-testid="skeleton" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="tb-skeleton h-9 rounded-sm border border-tb-border/60 bg-tb-bg-hover/60"
        />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full" data-testid="skeleton-table" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-3 border-t border-tb-border py-2.5"
          style={{ paddingBlock: "var(--tb-row-py, 0.625rem)" }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={cn(
                "tb-skeleton h-4 rounded-sm bg-tb-bg-hover/70",
                c === 0 ? "w-[40%]" : "w-[18%]",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
