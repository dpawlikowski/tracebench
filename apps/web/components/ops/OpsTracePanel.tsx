"use client";

import { useMemo } from "react";
import type { AgentRun } from "@tracebench/schemas";
import {
  projectSpansFromRun,
  type OpsSpan,
  type OpsSpanName,
} from "@tracebench/agent-runtime";
import { Badge, EmptyState, Panel, Spinner } from "@tracebench/ui";
import { HelpTip } from "@/components/help/HelpTip";

const NAME_TONE: Record<
  OpsSpanName,
  "neutral" | "success" | "warning" | "danger" | "accent"
> = {
  invoke_agent: "accent",
  chat: "neutral",
  execute_tool: "success",
  tool_approval: "warning",
};

function statusTone(status: OpsSpan["status"]): "success" | "danger" | "neutral" {
  if (status === "ok") return "success";
  if (status === "error") return "danger";
  return "neutral";
}

function formatDur(span: OpsSpan): string {
  if (!span.endTime) return "…";
  const ms = Date.parse(span.endTime) - Date.parse(span.startTime);
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function attrLine(span: OpsSpan): string {
  const a = span.attributes ?? {};
  const parts: string[] = [];
  if (a.tool_name) parts.push(String(a.tool_name));
  if (a.agent_name && span.name === "invoke_agent") parts.push(String(a.agent_name));
  if (a.decision) parts.push(String(a.decision));
  if (a["gen_ai.usage.cost_usd"] !== undefined) {
    parts.push(`$${Number(a["gen_ai.usage.cost_usd"]).toFixed(4)}`);
  }
  if (
    a["gen_ai.usage.input_tokens"] !== undefined ||
    a["gen_ai.usage.output_tokens"] !== undefined
  ) {
    const tin = a["gen_ai.usage.input_tokens"] ?? 0;
    const tout = a["gen_ai.usage.output_tokens"] ?? 0;
    parts.push(`${tin}+${tout}tok`);
  }
  if (a.summary && span.name === "chat") parts.push(String(a.summary));
  return parts.join(" · ");
}

export function OpsTracePanel({
  run,
  spans: spansProp,
  loading,
}: {
  /** Prefer live run projection (Demo Mode, no extra fetch). */
  run?: AgentRun;
  spans?: OpsSpan[];
  loading?: boolean;
}) {
  const spans = useMemo(() => {
    if (spansProp) return spansProp;
    if (run) return projectSpansFromRun(run);
    return [];
  }, [run, spansProp]);

  return (
    <Panel
      title="Ops Trace"
      className="tb-animate-in"
      action={
        <div className="flex items-center gap-2">
          <HelpTip
            title="Ops Trace"
            body="Read-only GenAI-shaped spans projected from domain/fixture events (invoke_agent · chat · execute_tool · tool_approval). Fixture today; OTLP / CF agent tracing later."
            href="/ops"
          />
          {loading ? <Spinner label="Loading spans" /> : null}
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-tb-text-dim">
            {spans.length} spans
          </span>
        </div>
      }
    >
      <div data-testid="ops-trace-panel">
        {loading && spans.length === 0 && (
          <div className="py-6 text-center text-[13px] text-tb-text-dim">Loading spans…</div>
        )}
        {!loading && spans.length === 0 && (
          <EmptyState
            title="No spans"
            description="This run has no projected OpsTelemetry spans yet."
          />
        )}
        {spans.length > 0 && (
          <ol className="m-0 list-none space-y-0 p-0" aria-label="Ops spans">
            {spans.map((span) => (
              <li
                key={span.id}
                data-testid={`ops-span-${span.name}`}
                className="tb-interactive flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-tb-border px-1 tb-row last:border-b-0"
              >
                <Badge
                  tone={NAME_TONE[span.name]}
                  className="shrink-0 font-mono text-[10px] normal-case tracking-normal"
                >
                  {span.name}
                </Badge>
                <Badge
                  tone={statusTone(span.status)}
                  className="shrink-0 font-mono text-[10px] normal-case tracking-normal"
                >
                  {span.status}
                </Badge>
                <code className="font-mono text-[11px] text-tb-text-dim">{formatDur(span)}</code>
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-tb-text-muted">
                  {attrLine(span) || span.id}
                </span>
                <time
                  className="shrink-0 font-mono text-[10px] text-tb-text-dim tabular-nums"
                  dateTime={span.startTime}
                >
                  {span.startTime.slice(11, 19)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Panel>
  );
}
