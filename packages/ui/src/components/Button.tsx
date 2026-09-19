"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "tb-interactive inline-flex items-center justify-center gap-1.5 rounded-md font-medium tracking-tight transition-[background-color,border-color,filter,color,transform,box-shadow] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--tb-accent)_75%,transparent)]",
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-tb-accent text-tb-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:brightness-[1.05]",
        secondary:
          "border border-tb-border bg-tb-bg-elevated text-tb-text hover:border-tb-border-strong hover:bg-tb-bg-hover",
        ghost:
          "border border-transparent bg-transparent text-tb-text-muted hover:bg-tb-bg-hover hover:text-tb-text",
        danger: "border border-tb-danger/35 bg-tb-danger-soft text-tb-danger hover:brightness-110",
        success: "border border-tb-success/35 bg-tb-success-soft text-tb-success hover:brightness-110",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3.5 text-[13px]",
        lg: "h-10 px-5 text-sm",
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
