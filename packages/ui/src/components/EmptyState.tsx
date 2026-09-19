import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function EmptyState({
  title,
  description,
  action,
  tone = "default",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "error" | "permission";
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-start gap-2 rounded-md border border-dashed border-tb-border bg-tb-bg-sunken/40 px-4 py-8",
        tone === "error" && "border-tb-danger/40 bg-tb-danger-soft/30",
        tone === "permission" && "border-tb-warning/40 bg-tb-warning-soft/30",
        className,
      )}
      data-testid="empty-state"
    >
      <div className="text-sm font-semibold tracking-tight text-tb-text">{title}</div>
      {description && <div className="max-w-md text-[13px] leading-relaxed text-tb-text-muted">{description}</div>}
      {action}
    </div>
  );
}
