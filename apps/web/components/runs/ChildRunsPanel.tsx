"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { AgentRun } from "@tracebench/schemas";
import { Badge, Panel, Spinner } from "@tracebench/ui";
import { useChildRuns } from "@/lib/hooks/use-child-runs";
import { statusTone } from "@/lib/format";

/** Thin container — fetches children via hook, list stays presentational. */
export function ChildRunsPanel({ run }: { run: AgentRun }) {
  const { children, isLoading } = useChildRuns(run, { staleTime: 15_000 });
  return <ChildRunsPanelView run={run} children={children} isLoading={isLoading} />;
}

/** Presentational child / lineage list — no TanStack Query. */
export function ChildRunsPanelView({
  run,
  children,
  isLoading = false,
}: {
  run: AgentRun;
  children: AgentRun[];
  isLoading?: boolean;
}) {
  const ids = run.childRunIds ?? [];
  const byId = useMemo(() => new Map(children.map((c) => [c.id, c])), [children]);

  if (ids.length === 0 && !run.parentRunId) return null;

  return (
    <Panel title={ids.length ? `Child agents (${ids.length})` : "Lineage"} data-testid="child-runs-panel">
      {ids.length > 0 && (
        <ul className="m-0 mb-2 flex list-none flex-col gap-2 p-0">
          {ids.map((id) => {
            const child = byId.get(id);
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-tb-border bg-tb-bg-sunken/60 px-3 py-2.5 transition-colors hover:border-tb-border-strong"
                data-testid={`child-run-${id}`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-tb-text">{child?.title ?? id}</div>
                  <div className="font-mono text-[11px] text-tb-text-dim">{id}</div>
                  {child?.agentName && (
                    <div className="mt-0.5 text-[12px] text-tb-text-muted">{child.agentName}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && !child && <Spinner label="Loading" />}
                  {child && (
                    <Badge tone={statusTone(child.status)}>
                      {child.status.replaceAll("_", " ")}
                    </Badge>
                  )}
                  <Link
                    href={`/runs/${id}`}
                    prefetch
                    className="text-[12px] font-medium text-tb-accent no-underline hover:underline"
                  >
                    Open child →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {run.parentRunId && (
        <p className="mb-0 mt-1 text-[12px] text-tb-text-muted">
          Parent:{" "}
          <Link
            href={`/runs/${run.parentRunId}`}
            className="text-tb-accent no-underline hover:underline"
          >
            {run.parentRunId}
          </Link>
        </p>
      )}
      <p className="mb-0 mt-2 text-[12px] text-tb-text-dim">
        <Link
          href={`/runs/${run.id}/graph`}
          className="text-tb-accent no-underline hover:underline"
          data-testid="open-run-graph"
        >
          Observe agent graph →
        </Link>
      </p>
    </Panel>
  );
}
