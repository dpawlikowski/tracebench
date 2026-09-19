"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import type { RunSummary } from "@tracebench/schemas";
import { Badge, EmptyState, Panel, Button, SkeletonTableRows } from "@tracebench/ui";
import { useRuns } from "@/lib/hooks/use-runs";
import { formatMs, formatTime, formatUsd, statusTone } from "@/lib/format";
import { prefetchRun } from "@/lib/prefetch";

const STATUS_FILTERS = [
  "all",
  "awaiting_approval",
  "succeeded",
  "failed",
  "denied",
  "running",
] as const;

export function RunsList() {
  const { data: runs, isLoading, isError, refetch, isFetching } = useRuns();
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  );

  const filtered = useMemo(() => {
    if (!runs) return runs;
    if (status === "all") return runs;
    return runs.filter((r) => r.status === status);
  }, [runs, status]);

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <div className="mb-5">
        <h1 className="m-0 text-[22px] font-semibold tracking-tight">Agent runs</h1>
        <p className="mt-1.5 text-tb-text-muted">
          Seeded OpsAgent sessions — open any run to replay the timeline. Filter via URL for
          shareable recruiter links.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" data-testid="runs-status-filters">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "primary" : "ghost"}
            onClick={() => void setStatus(s === "all" ? "all" : s)}
            data-testid={`filter-status-${s}`}
          >
            {s === "all" ? "All" : s.replaceAll("_", " ")}
          </Button>
        ))}
      </div>

      <Panel
        title={`${filtered?.length ?? 0} runs`}
        action={
          isFetching && !isLoading ? (
            <span className="text-[11px] text-tb-text-dim">Refreshing…</span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => void refetch()}>
              Refresh
            </Button>
          )
        }
      >
        {isLoading && <SkeletonTableRows rows={5} cols={4} />}
        {isError && (
          <EmptyState
            tone="error"
            title="Failed to load runs"
            description="The runs API did not respond. Check the BFF or try again."
            action={
              <Button variant="secondary" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          />
        )}
        {!isLoading && !isError && filtered && filtered.length === 0 && (
          <EmptyState
            title="No runs match this filter"
            description={
              status === "all"
                ? "Seed fixtures failed to load."
                : `No runs with status “${status.replaceAll("_", " ")}”. Clear the filter to see all seeded sessions.`
            }
            action={
              status !== "all" ? (
                <Button variant="secondary" onClick={() => void setStatus("all")}>
                  Clear filter
                </Button>
              ) : undefined
            }
          />
        )}
        {!isLoading && filtered && filtered.length > 0 && (
          <div className="tb-table-wrap -mx-1">
            <table className="w-full border-collapse text-[13px]" data-testid="runs-table">
              <thead>
                <tr className="text-left text-tb-text-dim">
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Run
                  </th>
                  <th className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                    Status
                  </th>
                  <th className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                    Cost / latency
                  </th>
                  <th className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((run) => (
                  <RunRow key={run.id} run={run} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

const RunRow = memo(function RunRow({ run }: { run: RunSummary }) {
  const queryClient = useQueryClient();
  const href = `/runs/${run.id}`;

  const warm = () => {
    void prefetchRun(queryClient, run.id);
  };

  return (
    <tr
      className="border-t border-tb-border transition-colors duration-150 hover:bg-tb-bg-hover/40"
      data-tour={run.id === "run_live_approve" ? "run-live" : undefined}
    >
      <td className="px-3 align-top" style={{ paddingBlock: "var(--tb-row-py)" }}>
        <Link
          href={href}
          prefetch
          data-testid={`run-row-${run.id}`}
          className="block text-inherit no-underline hover:no-underline"
          onMouseEnter={warm}
          onFocus={warm}
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-tb-text">{run.title}</span>
            <span className="sm:hidden">
              <Badge tone={statusTone(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
            </span>
          </div>
          <div className="mb-1.5 text-[13px] text-tb-text-muted">{run.goal}</div>
          <div className="flex flex-wrap gap-1.5">
            {run.tags.map((t) => (
              <Badge key={t} tone="neutral">
                {t}
              </Badge>
            ))}
          </div>
        </Link>
      </td>
      <td className="hidden px-3 align-middle sm:table-cell" style={{ paddingBlock: "var(--tb-row-py)" }}>
        <Badge tone={statusTone(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
      </td>
      <td
        className="hidden px-3 align-middle font-mono text-xs text-tb-text-muted tabular-nums md:table-cell"
        style={{ paddingBlock: "var(--tb-row-py)" }}
      >
        {formatUsd(run.metrics.totalCostUsd)} · {formatMs(run.metrics.totalLatencyMs)}
      </td>
      <td
        className="hidden px-3 align-middle text-[13px] text-tb-text-muted lg:table-cell"
        style={{ paddingBlock: "var(--tb-row-py)" }}
      >
        {formatTime(run.createdAt)}
      </td>
    </tr>
  );
});
