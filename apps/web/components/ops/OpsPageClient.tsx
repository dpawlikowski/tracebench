"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { OpsRunSpanSummary } from "@tracebench/agent-runtime";
import { Badge, EmptyState, Panel, SkeletonTableRows, Spinner } from "@tracebench/ui";
import { queryKeys } from "@/lib/query-keys";
import { fetchOpsSummaries } from "@/lib/api";
import { statusTone } from "@/lib/format";

export function OpsPageClient() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.ops,
    queryFn: fetchOpsSummaries,
  });

  return (
    <div
      className="mx-auto max-w-[1100px] px-5 pb-16 tb-animate-in"
      style={{ paddingTop: "var(--tb-pad-y)" }}
      data-testid="ops-page"
    >
      <div className="mb-5">
        <p className="tb-section-label m-0 mb-2">Telemetry</p>
        <h1 className="m-0 text-[22px] tracking-tight">Ops Trace</h1>
        <p className="mt-1.5 max-w-[640px] text-tb-text-muted">
          Read-only GenAI-shaped spans from{" "}
          <code className="font-mono text-[13px]">FixtureOpsTelemetry</code> (Demo Mode).
          Same port later wires OTLP export or Cloudflare agent tracing — no Inngest/Trigger.
        </p>
        {data?.kind && (
          <p className="mt-2 font-mono text-[11px] text-tb-text-dim">
            OPS_TELEMETRY · {data.kind}
          </p>
        )}
      </div>

      <Panel title="Recent fixture runs">
        {isLoading && (
          <div className="space-y-3" data-testid="ops-loading">
            <Spinner label="Loading ops summaries" />
            <SkeletonTableRows rows={4} cols={4} />
          </div>
        )}
        {isError && (
          <EmptyState
            tone="error"
            title="Failed to load ops summaries"
            description="Check /api/ops/runs and OPS_TELEMETRY=fixture."
            action={
              <button
                type="button"
                className="tb-interactive rounded-sm border border-tb-border px-3 py-1.5 text-[13px]"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            }
          />
        )}
        {data && data.runs.length === 0 && (
          <EmptyState title="No runs" description="Seed fixtures to see span counts." />
        )}
        {data && data.runs.length > 0 && (
          <div className="tb-table-wrap">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-tb-border font-mono text-[10px] uppercase tracking-[0.08em] text-tb-text-dim">
                  <th className="px-2 py-2 font-medium">Run</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium tabular-nums">Spans</th>
                  <th className="px-2 py-2 font-medium">By name</th>
                </tr>
              </thead>
              <tbody>
                {data.runs.map((row: OpsRunSpanSummary) => (
                  <tr key={row.runId} className="border-b border-tb-border last:border-0">
                    <td className="px-2 py-2">
                      <Link
                        href={`/runs/${row.runId}`}
                        className="font-medium text-tb-text no-underline hover:text-tb-accent"
                        data-testid={`ops-run-${row.runId}`}
                      >
                        {row.title}
                      </Link>
                      <div className="font-mono text-[11px] text-tb-text-dim">{row.runId}</div>
                    </td>
                    <td className="px-2 py-2">
                      <Badge tone={statusTone(row.status)}>
                        {row.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 font-mono tabular-nums text-tb-text-muted">
                      {row.spanCount}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1 font-mono text-[10px] text-tb-text-dim">
                        {(Object.entries(row.byName) as [string, number][]).map(([name, n]) =>
                          n > 0 ? (
                            <span
                              key={name}
                              className="rounded-sm border border-tb-border bg-tb-bg-sunken px-1.5 py-0.5"
                            >
                              {name}:{n}
                            </span>
                          ) : null,
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
