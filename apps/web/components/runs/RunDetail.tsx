"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMachine } from "@xstate/react";
import { useQueryClient } from "@tanstack/react-query";
import type { AgentRun } from "@tracebench/schemas";
import { Badge, Button, EmptyState, Kbd, Panel, Spinner } from "@tracebench/ui";
import { Timeline } from "@/components/timeline/Timeline";
import { MetricsRail } from "@/components/metrics/MetricsRail";
import { AuditLog } from "@/components/audit/AuditLog";
import { ApprovalGate } from "@/components/approvals/ApprovalGate";
import { RunLogs } from "@/components/logs/RunLogs";
import { ChildRunsPanel } from "@/components/runs/ChildRunsPanel";
import { HelpTip } from "@/components/help/HelpTip";
import { decisionSummary, formatTime, formatUsd, statusTone } from "@/lib/format";
import { runFlowMachine, visibleIdSet } from "@/lib/machines/run-flow";
import { queryKeys } from "@/lib/query-keys";
import { pushRecentRun } from "@/lib/recent-runs";
import { tbToast } from "@/lib/toast";

export function RunDetail({ initialRun }: { initialRun: AgentRun }) {
  const queryClient = useQueryClient();
  const [state, send] = useMachine(runFlowMachine, {
    input: { run: initialRun, speed: 1.4 },
  });
  const prevFlow = useRef<string>("");
  const auditRef = useRef<HTMLDivElement>(null);

  const run = state.context.run;
  const replaying = state.matches("replaying");
  const deciding = state.matches("deciding");
  const visibleIds = useMemo(
    () => visibleIdSet(state.context.visibleIds),
    [state.context.visibleIds],
  );

  useEffect(() => {
    pushRecentRun(run.id, run.title);
  }, [run.id, run.title]);

  useEffect(() => {
    send({ type: "REPLAY" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    queryClient.setQueryData(queryKeys.run(run.id), run);
    if (
      state.matches("awaitingApproval") ||
      state.matches("completed") ||
      state.matches("idle")
    ) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.runs });
    }
  }, [queryClient, run, state.value]);

  const pendingCount = useMemo(
    () => run.approvals.filter((a) => a.status === "pending").length,
    [run.approvals],
  );

  const escalated = useMemo(
    () =>
      run.approvals.filter((a) => a.risk === "high" || a.risk === "medium").length,
    [run.approvals],
  );

  const micro = decisionSummary({
    awaiting: pendingCount,
    burnUsd: run.metrics.totalCostUsd,
    jevEscalated: escalated,
  });

  const flowLabel = (() => {
    if (state.matches("replaying")) return "replaying";
    if (state.matches("awaitingApproval")) return "awaiting approval";
    if (state.matches("deciding")) return "deciding";
    if (state.matches("approved")) return "approved";
    if (state.matches("denied")) return "denied";
    if (state.matches("completed")) return "completed";
    if (state.matches("error")) return "error";
    return "idle";
  })();

  // Toasts on decision / replay / error transitions
  useEffect(() => {
    const label = flowLabel;
    if (label === prevFlow.current) return;
    const prev = prevFlow.current;
    prevFlow.current = label;

    const viewAudit = () => {
      auditRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    if (label === "approved" && prev === "deciding") {
      tbToast.success("Approved", "Decision recorded in audit", {
        runId: run.id,
        onViewAudit: viewAudit,
      });
    } else if (label === "denied" && prev === "deciding") {
      tbToast.info("Denied", "High-risk tool blocked", {
        runId: run.id,
        onViewAudit: viewAudit,
      });
    } else if (label === "error") {
      tbToast.error("Action failed", state.context.error ?? "Unknown error", {
        runId: run.id,
      });
    } else if (label === "replaying" && prev && prev !== "replaying") {
      tbToast.info("Replay started", "Streaming timeline events", { runId: run.id });
    }
  }, [flowLabel, run.id, state.context.error]);

  return (
    <div
      className="mx-auto max-w-[1280px] px-5 pb-16"
      style={{ paddingTop: "var(--tb-pad-y)" }}
      data-tour={run.id === "run_live_approve" ? "run-live" : undefined}
    >
      <div
        className="mb-5 flex flex-wrap items-start justify-between gap-4"
        data-testid="run-decision-header"
      >
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="m-0 text-[22px] tracking-tight">{run.title}</h1>
            <Badge tone={statusTone(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
            {pendingCount > 0 && <Badge tone="warning">{pendingCount} pending</Badge>}
            <Badge tone="neutral" className="normal-case tracking-normal">
              flow · {flowLabel}
            </Badge>
          </div>
          <p className="m-0 max-w-[720px] text-tb-text-muted">{run.goal}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-tb-text-dim">
            <span>
              {run.agentName} · {formatTime(run.createdAt)} · <code>{run.id}</code>
            </span>
            <span
              className="tabular-nums text-tb-text-muted"
              data-testid="run-decision-microcopy"
              aria-live="polite"
              aria-atomic="true"
            >
              {micro}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Button
                variant={replaying ? "primary" : "secondary"}
                onClick={() => send({ type: "REPLAY" })}
                disabled={replaying || deciding}
                data-testid="replay-btn"
                aria-pressed={replaying}
              >
                {replaying ? "Replaying…" : "Replay"}
              </Button>
              <Kbd>R</Kbd>
            </div>
            <span className="text-[10px] text-tb-text-dim">
              {replaying ? "▶ streaming · speed 1.4×" : "▶ play timeline from start"}
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => send({ type: "SHOW_ALL" })}
            data-testid="show-all-btn"
          >
            Show all
          </Button>
        </div>
      </div>

      {state.context.error && (
        <div className="mb-3">
          <EmptyState
            tone="error"
            title="Decision failed"
            description={state.context.error}
          />
        </div>
      )}

      <div data-tour="approval-gate">
        <ApprovalGate
          run={run}
          activeApprovalId={state.context.activeApprovalId}
          busy={deciding}
          error={
            state.matches("error") || state.matches("awaitingApproval")
              ? state.context.error
              : null
          }
          onOpen={(approvalId) => send({ type: "OPEN_APPROVAL", approvalId })}
          onClose={() => send({ type: "CLOSE_APPROVAL" })}
          onDecide={(decision) => send({ type: "DECIDE", decision })}
        />
      </div>

      <div
        className="run-detail-grid grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1fr)_300px]"
        style={{ gap: "var(--tb-section-gap)" }}
      >
        <div className="flex flex-col" style={{ gap: "var(--tb-section-gap)" }}>
          <Panel
            title="Tool-call timeline"
            action={
              <div className="flex items-center gap-2">
                <HelpTip
                  title="Timeline"
                  body="Thoughts, tools, approvals, and outcomes stream in order. Replay paces events; shape-of-run is a Canvas overview for scrubbing."
                  href="/help/anatomy-of-a-run"
                />
                {replaying ? <Spinner label="Streaming" /> : null}
              </div>
            }
          >
            <Timeline run={run} visibleEventIds={visibleIds} isReplaying={replaying} />
          </Panel>
          <div ref={auditRef}>
            <ChildRunsPanel run={run} />
          <AuditLog events={run.auditLog} />
          </div>
          <RunLogs run={run} isReplaying={replaying} />
        </div>
        <MetricsRail run={run} />
      </div>

      <p className="mt-6 font-mono text-[11px] text-tb-text-dim tabular-nums">
        Burn so far {formatUsd(run.metrics.totalCostUsd)} · tokens{" "}
        {run.metrics.tokensIn + run.metrics.tokensOut}
      </p>
    </div>
  );
}
