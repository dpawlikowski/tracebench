"use client";

import { Toaster as Sonner } from "sonner";
import { useReducedMotion } from "@/lib/prefs";

export function AppToaster() {
  const reduced = useReducedMotion();
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      visibleToasts={3}
      closeButton
      richColors={false}
      duration={4200}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "tb-toast group border border-tb-border-strong bg-tb-bg-elevated text-tb-text shadow-[var(--tb-shadow-modal)]",
          title: "text-[13px] font-semibold",
          description: "text-[12px] text-tb-text-muted",
          actionButton: "bg-tb-accent text-tb-accent-fg text-xs font-semibold",
          cancelButton: "bg-tb-bg-hover text-tb-text-muted text-xs",
          error: "border-tb-danger/50",
          success: "border-tb-success/40",
        },
      }}
      style={
        reduced
          ? ({ ["--normal-bg" as string]: "#0E0E10" } as React.CSSProperties)
          : undefined
      }
    />
  );
}
