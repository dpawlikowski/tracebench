"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { AgentRun } from "@tracebench/schemas";
import { Button, Panel, Stat } from "@tracebench/ui";
import Link from "next/link";
import { promoteWidgetToLiveRun } from "@/lib/dashboards/layout";
import { seriesFromRun } from "@/lib/metrics/series";
import { tbToast } from "@/lib/toast";
import { formatMs, formatUsd } from "@/lib/format";

const Sparkline = dynamic(
  () => import("@/components/metrics/Sparkline").then((m) => m.Sparkline),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 rounded-sm border border-dashed border-tb-border bg-tb-bg/40" />
    ),
  },
);

export function MetricsRail({ run }: { run: AgentRun }) {
  const m = run.metrics;
  const seriesKey = `${run.id}|${m.totalCostUsd}|${m.totalLatencyMs}|${run.toolCalls.length}|${run.toolCalls.map((t) => t.latencyMs ?? "").join(",")}`;
  const { cost, latency } = useMemo(() => seriesFromRun(run), [run, seriesKey]);

  return (
    <Panel
      title="Cost / latency"
      className="sticky top-16"
      action={
        <Button
          size="sm"
          variant="ghost"
          data-testid="promote-cost-widget"
          onClick={() => {
            promoteWidgetToLiveRun("cost_burn");
            tbToast.success("Added to dashboard", "Cost burn tile on Live Run board");
          }}
        >
          Add to dashboard
        </Button>
      }
    >
      <div data-testid="metrics-rail" className="grid gap-4">
        <Stat label="Total cost" value={formatUsd(m.totalCostUsd)} />
        <Sparkline series={cost} label="Cost burn" color="#B4F03C" />
        <Stat label="Wall latency" value={formatMs(m.totalLatencyMs)} />
        <Sparkline series={latency} label="Latency accum" color="#4ADE80" />
        <Stat label="Tokens in / out" value={`${m.tokensIn} / ${m.tokensOut}`} />
        <Stat label="Tool calls" value={String(m.toolCallCount)} />
        <Stat
          label="Approvals"
          value={`${m.approvalCount}`}
          hint={m.deniedCount ? `${m.deniedCount} denied` : undefined}
        />
        <Stat
          label="p50 / p95 tool"
          value={`${formatMs(m.p50ToolLatencyMs ?? 0)} / ${formatMs(m.p95ToolLatencyMs ?? 0)}`}
        />
        {m.failedToolCount > 0 && (
          <Stat label="Failed tools" value={String(m.failedToolCount)} />
        )}
        <Link
          href="/dashboards"
          className="mt-2 text-[12px] text-tb-accent no-underline hover:underline"
          data-testid="open-dashboards"
        >
          Open dashboards →
        </Link>
      </div>
    </Panel>
  );
}
