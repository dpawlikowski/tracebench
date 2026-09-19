"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "tb-interactive inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold transition-[background-color,border-color,filter,color,transform] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-tb-accent text-tb-accent-fg hover:brightness-110",
        secondary:
          "border border-tb-border-strong bg-tb-bg-hover text-tb-text hover:border-tb-accent/40 hover:bg-tb-bg-hover",
        ghost:
          "border border-tb-border bg-transparent text-tb-text-muted hover:border-tb-border-strong hover:bg-tb-bg-hover hover:text-tb-text",
        danger: "border border-tb-danger bg-tb-danger-soft text-tb-danger hover:brightness-110",
        success: "border border-tb-success bg-tb-success-soft text-tb-success hover:brightness-110",
      },
      size: {
        sm: "px-2.5 py-1 text-xs",
        md: "px-3.5 py-2 text-[13px]",
        lg: "px-5 py-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", children, className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export { buttonVariants };
