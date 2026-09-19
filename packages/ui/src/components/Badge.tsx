import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-tb-border bg-tb-bg-hover/70 text-tb-text-muted",
        accent: "border-tb-accent/25 bg-tb-accent-soft text-tb-accent",
        success: "border-tb-success/30 bg-tb-success-soft text-tb-success",
        warning: "border-tb-warning/30 bg-tb-warning-soft text-tb-warning",
        danger: "border-tb-danger/30 bg-tb-danger-soft text-tb-danger",
        low: "border-risk-low/25 bg-risk-low-soft text-risk-low",
        medium: "border-risk-medium/30 bg-risk-medium-soft text-risk-medium",
        high: "border-risk-high/30 bg-risk-high-soft text-risk-high",
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
