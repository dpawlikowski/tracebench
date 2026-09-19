export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-tb-text-dim">{label}</span>
      <span className="font-mono text-lg font-semibold text-tb-text tabular-nums">{value}</span>
      {hint && <span className="text-[11px] text-tb-text-muted">{hint}</span>}
    </div>
  );
}
