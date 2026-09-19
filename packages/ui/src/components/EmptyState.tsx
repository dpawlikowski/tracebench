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
        "flex flex-col items-start gap-2 rounded-lg border border-dashed border-tb-border bg-tb-bg-sunken/50 px-5 py-10",
        tone === "error" && "border-tb-danger/35 bg-tb-danger-soft/25",
        tone === "permission" && "border-tb-warning/35 bg-tb-warning-soft/25",
        className,
      )}
      data-testid="empty-state"
    >
      <div className="text-sm font-medium tracking-tight text-tb-text">{title}</div>
      {description && <div className="max-w-md text-[13px] leading-relaxed text-tb-text-muted">{description}</div>}
      {action}
    </div>
  );
}
