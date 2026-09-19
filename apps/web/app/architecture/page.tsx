import Link from "next/link";

export const metadata = {
  title: "Architecture — Tracebench",
  description: "Event-sourced runs, HITL, Jev, nested agents, observe graph.",
};

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <p className="tb-section-label m-0 mb-2">System</p>
      <h1 className="tb-title m-0">Architecture</h1>
      <p className="tb-subtitle mt-2">
        Control plane for irreversible agent work — event log is truth; UI is a projection.
        ADRs:{" "}
        <Link href="/help/transports-health" className="text-tb-accent">
          transports
        </Link>
        , docs/adr in repo.
      </p>

      <pre className="mt-6 overflow-auto rounded-md border border-tb-border bg-tb-bg p-4 text-[11px] leading-relaxed text-tb-text-muted">{`
flowchart LR
  subgraph fixtures [Demo Mode defaults]
    F[Seeded OpsAgent runs]
    MJ[Mock Jev]
  end
  subgraph domain [Pure TS]
    E[DomainEvent]
    R[reduce]
    C[decideApproval]
  end
  subgraph web [apps/web]
    UI[Timeline / HITL / Logs]
    G[Observe graph xyflow]
    D[Dashboards]
  end
  F --> E --> R --> UI
  MJ --> C
  R --> G
  R --> D
  CF[CF Agents DO] -. opt-in .-> web
  LJ[Live Jev] -. opt-in .-> C
`}</pre>

      <h2 className="tb-section-label mt-8">Invariants</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-[14px] text-tb-text">
        <li>Approvals are commands → events → reduce (never mutate UI-only state as source of truth).</li>
        <li>Multi-agent = nested AgentRuns + AgentMessage events; graph never invents edges.</li>
        <li>Demo Mode: fixture + mock-jev — full click-through with zero keys.</li>
        <li>Health returns 503 on critical failure (not a lying 200).</li>
      </ul>

      <p className="mt-6 text-[13px] text-tb-text-dim">
        See <code className="font-mono">ARCHITECTURE.md</code>,{" "}
        <code className="font-mono">docs/PRODUCT_PLAN.md</code>,{" "}
        <Link href="/help/demo-mode" className="text-tb-accent">
          Demo mode
        </Link>
        .
      </p>
    </div>
  );
}
