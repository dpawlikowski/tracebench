import { cn } from "../lib/cn";

/** Keyboard chip next to primary actions. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded-sm border border-tb-border bg-tb-bg px-1.5 py-0.5 font-mono text-[10px] font-medium text-tb-text-dim",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
