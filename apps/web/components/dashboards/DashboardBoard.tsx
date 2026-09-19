"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button, Badge } from "@tracebench/ui";
import { useRuns } from "@/lib/hooks/use-runs";
import { useEvals } from "@/lib/hooks/use-evals";
import { useRunsDetails } from "@/lib/hooks/use-runs-details";
import {
  PRESET_FLEET,
  PRESET_LIVE_RUN,
  loadLayout,
  saveLayout,
  type DashItem,
  type DashPreset,
  type WidgetId,
} from "@/lib/dashboards/layout";
import {
  a2aCount,
  fleetMetrics,
  fleetSeries,
  toolMixFromRuns,
} from "@/lib/dashboards/metrics";
import {
  DonutWidget,
  KpiWidget,
  SparkKpiWidget,
  ToolMixWidget,
  formatMs,
  formatUsd,
} from "@/components/dashboards/widgets";
import { HelpTip } from "@/components/help/HelpTip";

const AutoGrid = WidthProvider(GridLayout);

export function DashboardBoard() {
  const [mounted, setMounted] = useState(false);
  const [preset, setPreset] = useState<DashPreset>("live_run");
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<DashItem[]>(PRESET_LIVE_RUN);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { data: runs, isLoading: runsLoading } = useRuns();
  const { data: evals, isLoading: evalsLoading } = useEvals();

  useEffect(() => {
    setLayout(loadLayout(preset));
  }, [preset]);

  const parentish = useMemo(
    () => (runs ?? []).filter((r) => !r.parentRunId).slice(0, 8),
    [runs],
  );

  const detailIds = useMemo(() => parentish.map((r) => r.id), [parentish]);
  const { runs: detailRuns } = useRunsDetails(detailIds, { staleTime: 30_000 });

  const metrics = useMemo(
    () => fleetMetrics(runs ?? [], evals?.report),
    [runs, evals],
  );
  const mix = useMemo(() => toolMixFromRuns(detailRuns), [detailRuns]);
  const a2a = useMemo(() => a2aCount(detailRuns), [detailRuns]);
  const sparks = useMemo(() => fleetSeries(runs ?? []), [runs]);
  const loading = runsLoading || evalsLoading;

  const onLayoutChange = useCallback(
    (next: Layout[]) => {
      if (!editing) return;
      const mapped: DashItem[] = next.map((n) => ({
        i: n.i as WidgetId,
        x: n.x,
        y: n.y,
        w: n.w,
        h: n.h,
        minW: 2,
        minH: 2,
      }));
      setLayout(mapped);
    },
    [editing],
  );

  const save = () => {
    saveLayout(preset, layout);
    setEditing(false);
  };

  const reset = () => {
    const base = preset === "fleet_release" ? PRESET_FLEET : PRESET_LIVE_RUN;
    setLayout(base);
    saveLayout(preset, base);
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "cost_burn":
        return (
          <SparkKpiWidget
            id={id}
            loading={loading}
            label="Total cost"
            value={formatUsd(metrics.totalCost)}
            hint={`${metrics.runCount} runs`}
            series={sparks.cost}
            color="#B8FF3D"
            href="/runs"
          />
        );
      case "latency_p95":
        return (
          <SparkKpiWidget
            id={id}
            loading={loading}
            label="p95 tool"
            value={formatMs(metrics.p95)}
            series={sparks.latency}
            color="#4ADE80"
            href="/runs"
          />
        );
      case "tokens":
        return (
          <KpiWidget
            id={id}
            loading={loading}
            label="Tokens in / out"
            value={`${metrics.tokensIn} / ${metrics.tokensOut}`}
          />
        );
      case "approval_wait":
        return (
          <KpiWidget
            id={id}
            loading={loading}
            label="Awaiting approval"
            value={String(metrics.awaiting)}
            href="/runs?status=awaiting_approval"
          />
        );
      case "pending_hitl":
        return (
          <KpiWidget
            id={id}
            loading={loading}
            label="Approval events"
            value={String(metrics.pendingApprovals)}
            hint="across seeded runs"
            href="/runs?status=awaiting_approval"
          />
        );
      case "jev_escalate":
        return (
          <DonutWidget
            id={id}
            loading={loading}
            value={metrics.jevEscalatePct}
            label="Escalated"
            href="/policy"
          />
        );
      case "eval_pass":
        return (
          <DonutWidget
            id={id}
            loading={loading}
            value={metrics.evalPassRate ?? 0}
            label={metrics.evalGate ? `Gate ${metrics.evalGate}` : "Pass rate"}
            href="/evals"
          />
        );
      case "tool_mix":
        return <ToolMixWidget data={mix} loading={loading && mix.length === 0} />;
      case "a2a_rate":
        return (
          <KpiWidget
            id={id}
            loading={loading}
            label="A2A messages"
            value={String(a2a)}
            hint="from timeline events"
            href="/runs/run_pipeline_ops"
          />
        );
      default:
        return null;
    }
  };

  const scopeLabel = preset === "fleet_release" ? "Fleet scope" : "Live run scope";

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="m-0 text-[22px] tracking-tight">Ops dashboards</h1>
            <span data-testid="dash-scope-chip">
              <Badge
                tone={preset === "fleet_release" ? "accent" : "warning"}
                className="normal-case tracking-normal"
              >
                {scopeLabel}
              </Badge>
            </span>
          </div>
          <p className="mt-1.5 max-w-[640px] text-tb-text-muted">
            Layout preferences over the same fixture projections — not a second source of truth.
            Edit mode persists to <code className="font-mono text-[12px]">localStorage</code>.
            KPI tiles deep-link into runs, evals, and A2A.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HelpTip
            title="Dashboards"
            body="Widgets read /api/runs and /api/evals. Presets: Live Run (HITL) and Fleet/Release (evals). Zero external agents. Drag handle only in edit mode — KPI links stay clickable."
            href="/help/getting-started"
          />
          <Button
            size="sm"
            variant={preset === "live_run" ? "primary" : "ghost"}
            onClick={() => setPreset("live_run")}
            data-testid="dash-preset-live"
          >
            Live Run
          </Button>
          <Button
            size="sm"
            variant={preset === "fleet_release" ? "primary" : "ghost"}
            onClick={() => setPreset("fleet_release")}
            data-testid="dash-preset-fleet"
          >
            Fleet / Release
          </Button>
          {editing ? (
            <>
              <Button size="sm" variant="success" onClick={save} data-testid="dash-save">
                Save layout
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(true)}
              data-testid="dash-edit"
            >
              Edit layout
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={reset} data-testid="dash-reset">
            Reset preset
          </Button>
          {editing && <Badge tone="warning">editing</Badge>}
        </div>
      </div>

      <div data-testid="dashboard-board">
        {!mounted ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {layout.map((item) => (
              <div key={item.i} className="min-h-[156px]">
                {renderWidget(item.i)}
              </div>
            ))}
          </div>
        ) : (
          <AutoGrid
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={72}
            margin={[12, 12]}
            compactType="vertical"
            isDraggable={editing}
            isResizable={editing}
            onLayoutChange={onLayoutChange}
            draggableHandle=".tb-dash-drag"
          >
            {layout.map((item) => (
              <div key={item.i} className="relative">
                {editing && (
                  <div className="tb-dash-drag absolute right-2 top-2 z-10 cursor-move rounded-sm border border-tb-border bg-tb-bg px-1.5 py-0.5 text-[10px] text-tb-text-dim">
                    drag
                  </div>
                )}
                {renderWidget(item.i)}
              </div>
            ))}
          </AutoGrid>
        )}
      </div>
    </div>
  );
}
