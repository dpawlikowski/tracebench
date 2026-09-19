import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export function Panel({
  title,
  action,
  children,
  style,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-md border border-tb-border bg-tb-bg-elevated shadow-none",
        className,
      )}
      style={style}
    >
      {(title || action) && (
        <header
          className="flex items-center justify-between gap-2 border-b border-tb-border px-3.5"
          style={{ paddingBlock: "var(--tb-panel-head-py, 0.625rem)" }}
        >
          <h2 className="m-0 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-tb-text-dim">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div
        className="min-h-0 flex-1 overflow-auto px-3.5"
        style={{ paddingBlock: "var(--tb-panel-pad, 1rem)" }}
      >
        {children}
      </div>
    </section>
  );
}
