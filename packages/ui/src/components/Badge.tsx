import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-tb-border bg-tb-bg-hover text-tb-text-muted",
        accent: "border-tb-accent bg-tb-accent-soft text-tb-accent",
        success: "border-tb-success bg-tb-success-soft text-tb-success",
        warning: "border-tb-warning bg-tb-warning-soft text-tb-warning",
        danger: "border-tb-danger bg-tb-danger-soft text-tb-danger",
        low: "border-risk-low bg-risk-low-soft text-risk-low",
        medium: "border-risk-medium bg-risk-medium-soft text-risk-medium",
        high: "border-risk-high bg-risk-high-soft text-risk-high",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

export { badgeVariants };
