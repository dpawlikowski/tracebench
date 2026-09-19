import { cn } from "../lib/cn";

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] font-medium tracking-tight text-tb-text-dim">
        {label}
      </span>
      <span className="font-mono text-[22px] font-semibold leading-none tracking-tight text-tb-text tabular-nums">
        {value}
      </span>
      {hint && <span className="text-[11px] leading-snug text-tb-text-muted">{hint}</span>}
    </div>
  );
}
