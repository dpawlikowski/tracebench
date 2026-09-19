export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2.5 text-tb-text-muted"
      data-testid="spinner"
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full border-2 border-tb-border-strong border-t-tb-accent"
        style={{ animation: "tb-spin 0.7s linear infinite" }}
      />
      <span>{label}</span>
    </div>
  );
}
