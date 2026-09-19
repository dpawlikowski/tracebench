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
        "tb-glow-panel flex min-h-0 flex-col rounded-md border border-tb-border bg-tb-bg-elevated",
        className,
      )}
      style={style}
    >
      {(title || action) && (
        <header
          className="flex items-center justify-between gap-2 border-b border-tb-border px-3.5"
          style={{ paddingBlock: "var(--tb-panel-head-py, 0.625rem)" }}
        >
          <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-tb-text-muted">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div
        className="min-h-0 flex-1 overflow-auto px-3.5"
        style={{ paddingBlock: "var(--tb-panel-pad, 0.875rem)" }}
      >
        {children}
      </div>
    </section>
  );
}
