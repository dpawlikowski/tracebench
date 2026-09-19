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
  WIDGET_META,
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

const MAX_W = 12;
const MAX_H = 6;

function clampSize(item: DashItem, dw: number, dh: number): DashItem {
  const minW = item.minimized ? 2 : (item.minW ?? 2);
  const minH = item.minimized ? 1 : (item.minH ?? 2);
  return {
    ...item,
    w: Math.min(MAX_W, Math.max(minW, item.w + dw)),
    h: Math.min(MAX_H, Math.max(minH, item.h + dh)),
  };
}

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
      setLayout((prev) => {
        const byId = new Map(prev.map((p) => [p.i, p]));
        return next.map((n) => {
          const old = byId.get(n.i as WidgetId);
          const minimized = old?.minimized ?? false;
          return {
            i: n.i as WidgetId,
            x: n.x,
            y: n.y,
            w: n.w,
            h: minimized ? 1 : n.h,
            minW: 2,
            minH: minimized ? 1 : 2,
            minimized,
            prevH: old?.prevH,
          };
        });
      });
    },
    [editing],
  );

  const patchItem = useCallback((id: WidgetId, fn: (item: DashItem) => DashItem) => {
    setLayout((prev) => prev.map((it) => (it.i === id ? fn(it) : it)));
  }, []);

  const grow = (id: WidgetId) =>
    patchItem(id, (it) => clampSize(it, it.minimized ? 0 : 1, it.minimized ? 0 : 1));
  const shrink = (id: WidgetId) =>
    patchItem(id, (it) => clampSize(it, it.minimized ? 0 : -1, it.minimized ? 0 : -1));

  const toggleMinimize = (id: WidgetId) =>
    patchItem(id, (it) => {
      if (it.minimized) {
        const restored = it.prevH ?? 2;
        return {
          ...it,
          minimized: false,
          h: Math.max(2, restored),
          minH: 2,
          prevH: undefined,
        };
      }
      return {
        ...it,
        minimized: true,
        prevH: it.h,
        h: 1,
        minH: 1,
      };
    });

  const save = () => {
    saveLayout(preset, layout);
    setEditing(false);
  };

  const reset = () => {
    const base = preset === "fleet_release" ? PRESET_FLEET : PRESET_LIVE_RUN;
    setLayout(base);
    saveLayout(preset, base);
  };

  const renderWidget = (id: WidgetId, minimized?: boolean) => {
    if (minimized) {
      const title = WIDGET_META[id]?.title ?? id;
      return (
        <div
          className="flex h-full items-center rounded-md border border-tb-border bg-tb-bg-elevated px-3"
          data-testid={`widget-${id}-minimized`}
        >
          <span className="truncate text-[12px] font-medium tracking-tight text-tb-text">
            {title}
          </span>
        </div>
      );
    }
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
            color="#B4F03C"
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

  const gridLayout: Layout[] = layout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.minimized ? 1 : item.h,
    minW: 2,
    minH: item.minimized ? 1 : 2,
    isResizable: editing && !item.minimized,
  }));

  return (
    <div className="tb-page max-w-[1280px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <p className="tb-section-label m-0 mb-2">Boards</p>
            <h1 className="tb-title m-0">Ops dashboards</h1>
            <span data-testid="dash-scope-chip">
              <Badge
                tone={preset === "fleet_release" ? "accent" : "warning"}
                className="normal-case tracking-normal"
              >
                {scopeLabel}
              </Badge>
            </span>
          </div>
          <p className="tb-subtitle mt-1.5 max-w-[640px]">
            Drag, resize, and minimize widgets. Edit mode saves to{" "}
            <code className="font-mono text-[12px]">localStorage</code>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HelpTip
            title="Dashboards"
            body="In Edit layout: drag handle to move, corner handle or −/+ to resize, ▢/— to minimize to title. Save persists the board."
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

      <div data-testid="dashboard-board" className="tb-dash-board">
        {!mounted ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {layout.map((item) => (
              <div key={item.i} className="min-h-[156px] overflow-hidden">
                {renderWidget(item.i, item.minimized)}
              </div>
            ))}
          </div>
        ) : (
          <AutoGrid
            className="layout"
            layout={gridLayout}
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
              <div key={item.i} className="relative overflow-hidden rounded-md">
                {editing && (
                  <div className="absolute right-1.5 top-1.5 z-20 flex items-center gap-0.5">
                    <button
                      type="button"
                      className="tb-dash-drag cursor-move rounded border border-tb-border bg-tb-bg px-1.5 py-0.5 text-[10px] text-tb-text-dim hover:border-tb-border-strong hover:text-tb-text"
                      aria-label={`Drag ${item.i}`}
                      data-testid={`dash-drag-${item.i}`}
                    >
                      drag
                    </button>
                    {!item.minimized && (
                      <>
                        <button
                          type="button"
                          className="rounded border border-tb-border bg-tb-bg px-1.5 py-0.5 text-[10px] text-tb-text-dim hover:text-tb-text"
                          onClick={() => shrink(item.i)}
                          aria-label="Shrink widget"
                          data-testid={`dash-shrink-${item.i}`}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="rounded border border-tb-border bg-tb-bg px-1.5 py-0.5 text-[10px] text-tb-text-dim hover:text-tb-text"
                          onClick={() => grow(item.i)}
                          aria-label="Enlarge widget"
                          data-testid={`dash-grow-${item.i}`}
                        >
                          +
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="rounded border border-tb-border bg-tb-bg px-1.5 py-0.5 text-[10px] text-tb-text-dim hover:text-tb-text"
                      onClick={() => toggleMinimize(item.i)}
                      aria-label={item.minimized ? "Restore widget" : "Minimize widget"}
                      data-testid={`dash-min-${item.i}`}
                      title={item.minimized ? "Restore" : "Minimize to title"}
                    >
                      {item.minimized ? "▢" : "—"}
                    </button>
                  </div>
                )}
                {renderWidget(item.i, item.minimized)}
              </div>
            ))}
          </AutoGrid>
        )}
      </div>
    </div>
  );
}
