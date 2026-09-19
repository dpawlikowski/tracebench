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
        "flex flex-col items-start gap-2.5 rounded-lg border border-dashed px-5 py-10",
        tone === "default" && "border-tb-border bg-tb-bg-sunken/40",
        tone === "error" && "border-tb-danger/35 bg-tb-danger-soft/20",
        tone === "permission" && "border-tb-warning/35 bg-tb-warning-soft/20",
        className,
      )}
      data-testid="empty-state"
    >
      <div className="h-1 w-8 rounded-full bg-tb-border" aria-hidden />
      <div className="text-sm font-medium tracking-tight text-tb-text">{title}</div>
      {description && (
        <div className="max-w-md text-[13px] leading-relaxed text-tb-text-muted">{description}</div>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
