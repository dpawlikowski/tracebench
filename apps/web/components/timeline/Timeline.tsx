"use client";

import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion as useMotionReduced } from "motion/react";
import type { AgentRun, TimelineEvent, ToolCall, Approval } from "@tracebench/schemas";
import { Badge, Tooltip } from "@tracebench/ui";
import { formatMs, riskTone, statusTone } from "@/lib/format";
import { fadeSlide, motionTokens } from "@/lib/motion";

const ShapeOfRun = dynamic(
  () => import("@/components/timeline/ShapeOfRun").then((m) => m.ShapeOfRun),
  {
    ssr: false,
    loading: () => (
      <div className="mb-4 h-11 animate-pulse rounded-md border border-tb-border bg-tb-bg-sunken" />
    ),
  },
);

export function Timeline({
  run,
  visibleEventIds,
  isReplaying,
}: {
  run: AgentRun;
  visibleEventIds: Set<string>;
  isReplaying: boolean;
}) {
  const events = useMemo(
    () => run.timeline.filter((e) => visibleEventIds.has(e.id)),
    [run.timeline, visibleEventIds],
  );
  const reduceMotion = useMotionReduced();

  const onSelectEvent = useCallback((eventId: string) => {
    const el = document.getElementById(`tl-${eventId}`);
    el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }, [reduceMotion]);

  return (
    <div data-testid="timeline" className="flex flex-col gap-0">
      <ShapeOfRun run={run} visibleEventIds={visibleEventIds} onSelectEvent={onSelectEvent} />
      {events.length === 0 && (
        <div className="px-1 py-8 text-[13px] text-tb-text-muted" data-testid="timeline-empty">
          {isReplaying ? "Waiting for first event…" : "Press Replay to stream the timeline."}
        </div>
      )}
      {events.map((event, idx) => {
        const anim = fadeSlide({
          reduced: !!reduceMotion,
          delay: reduceMotion ? 0 : motionTokens.stagger(idx),
        });
        return (
          <motion.div key={event.id} {...anim}>
            <TimelineRow event={event} run={run} isLast={idx === events.length - 1} />
          </motion.div>
        );
      })}
      {isReplaying && (
        <div
          className="px-1 py-3 font-mono text-[11px] text-tb-accent"
          data-testid="timeline-streaming"
        >
          ● streaming…
        </div>
      )}
    </div>
  );
}

const TimelineRow = memo(function TimelineRow({
  event,
  run,
  isLast,
}: {
  event: TimelineEvent;
  run: AgentRun;
  isLast: boolean;
}) {
  const risk = eventRisk(event, run);
  return (
    <div
      data-testid={`timeline-event-${event.id}`}
      id={`tl-${event.id}`}
      data-risk={risk ?? undefined}
      className="grid grid-cols-[20px_1fr] gap-3"
    >
      <div className="flex flex-col items-center">
        <span
          className="mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{
            background: dotColor(event, risk),
            boxShadow: `0 0 0 3px ${dotColor(event, risk)}22`,
          }}
        />
        {!isLast && <span className="mt-1 w-0.5 flex-1 bg-tb-border" />}
      </div>
      <div style={{ paddingBottom: "var(--tb-row-py, 1rem)" }}>
        <EventBody event={event} run={run} />
      </div>
    </div>
  );
});

function eventRisk(event: TimelineEvent, run: AgentRun): string | null {
  if (event.kind === "tool") {
    return run.toolCalls.find((t) => t.id === event.toolCallId)?.risk ?? null;
  }
  if (event.kind === "approval") {
    return run.approvals.find((a) => a.id === event.approvalId)?.risk ?? null;
  }
  return null;
}

function dotColor(event: TimelineEvent, risk: string | null): string {
  if (risk === "high") return "var(--tb-risk-high)";
  if (risk === "medium") return "var(--tb-risk-medium)";
  if (event.kind === "outcome") {
    if (event.status === "succeeded") return "var(--tb-success)";
    if (event.status === "failed" || event.status === "denied") return "var(--tb-danger)";
    return "var(--tb-warning)";
  }
  if (event.kind === "approval") return "var(--tb-warning)";
  if (event.kind === "tool") return "var(--tb-accent)";
  if (event.kind === "agent_spawn" || event.kind === "agent_message") return "var(--tb-accent)";
  if (event.kind === "agent_await") return "var(--tb-warning)";
  if (event.kind === "agent_join") return "var(--tb-success)";
  return "var(--tb-text-dim)";
}

function EventBody({ event, run }: { event: TimelineEvent; run: AgentRun }) {
  if (event.kind === "thought") {
    return (
      <div>
        <div className="mb-1 text-[11px] font-medium tracking-tight text-tb-text-dim">Thought</div>
        <div className="italic text-tb-text-muted">{event.text}</div>
      </div>
    );
  }
  if (event.kind === "tool") {
    const tc = run.toolCalls.find((t) => t.id === event.toolCallId);
    return tc ? <ToolCard tool={tc} /> : <div>Unknown tool</div>;
  }
  if (event.kind === "approval") {
    const ap = run.approvals.find((a) => a.id === event.approvalId);
    return ap ? <ApprovalCard approval={ap} /> : <div>Unknown approval</div>;
  }
  if (event.kind === "agent_spawn") {
    return (
      <div data-testid={`agent-spawn-${event.childRunId}`}>
        <div className="mb-1 text-[11px] font-medium tracking-tight text-tb-accent">Agent spawn</div>
        <div className="font-medium">
          Spawned <code className="font-mono text-[13px]">{event.agent.name}</code>{" "}
          <Badge tone="neutral">{event.agent.role}</Badge>
        </div>
        <div className="mt-1 font-mono text-[11px] text-tb-text-dim">{event.childRunId}</div>
      </div>
    );
  }
  if (event.kind === "agent_message") {
    return (
      <div data-testid={`agent-message-${event.id}`}>
        <div className="mb-1 text-[11px] font-medium tracking-tight text-tb-success">Agent message</div>
        <div className="font-mono text-[12px]">
          <span className="text-tb-accent">{event.fromAgentId}</span>
          <span className="text-tb-text-dim"> → </span>
          <span className="text-tb-accent">{event.toAgentId}</span>
          <Badge tone="neutral" className="ml-2">
            {event.channel}
          </Badge>
        </div>
        <div className="mt-1 text-[13px] text-tb-text-muted">{event.payloadSummary}</div>
      </div>
    );
  }
  if (event.kind === "agent_await") {
    return (
      <div>
        <div className="mb-1 text-[11px] font-medium tracking-tight text-tb-warning">Agent await</div>
        <div className="text-[13px]">
          Waiting on <code className="font-mono">{event.awaitedRunId}</code>
        </div>
      </div>
    );
  }
  if (event.kind === "agent_join") {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-medium tracking-tight text-tb-text-dim">Agent join</span>
          <Badge tone={statusTone(event.outcome)}>{event.outcome}</Badge>
        </div>
        <div className="font-mono text-[12px] text-tb-text-muted">{event.childRunId}</div>
        {event.summary && <div className="mt-1 text-[13px]">{event.summary}</div>}
      </div>
    );
  }
  if (event.kind === "outcome") {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-medium tracking-tight text-tb-text-dim">Outcome</span>
          <Badge tone={statusTone(event.status)}>{event.status.replaceAll("_", " ")}</Badge>
        </div>
        <div className="font-medium">{event.summary}</div>
      </div>
    );
  }
  return null;
}

const ToolCard = memo(function ToolCard({ tool }: { tool: ToolCall }) {
  const riskBorder =
    tool.risk === "high"
      ? "border-risk-high/40"
      : tool.risk === "medium"
        ? "border-risk-medium/35"
        : "border-tb-border";
  return (
    <div
      className={`rounded-md border bg-tb-bg-sunken p-3.5 ${riskBorder}`}
      data-testid={`tool-card-${tool.id}`}
      data-risk={tool.risk}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <code className="font-mono text-[13px] font-semibold">{tool.toolName}</code>
        <Badge tone={riskTone(tool.risk)}>{tool.risk}</Badge>
        <Badge tone={statusTone(tool.status)}>{tool.status.replaceAll("_", " ")}</Badge>
        {tool.latencyMs !== undefined && (
          <span className="font-mono text-[11px] text-tb-text-dim tabular-nums">
            {formatMs(tool.latencyMs)}
          </span>
        )}
        <code className="font-mono text-[10px] text-tb-text-dim">{tool.id}</code>
      </div>
      <MonoExpandable value={tool.args} />
      {tool.error && <div className="mt-2 text-xs text-tb-danger">{tool.error}</div>}
      {tool.result !== undefined && (
        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-tb-success">
          → {JSON.stringify(tool.result)}
        </pre>
      )}
    </div>
  );
});

function MonoExpandable({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const text = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const long = text.length > 160 || text.split("\n").length > 4;
  const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;
  return (
    <div>
      <Tooltip content={<span className="font-mono whitespace-pre-wrap">{preview}</span>}>
      <pre
        className="tb-mono-trunc m-0 whitespace-pre-wrap break-words font-mono text-[11px] text-tb-text-muted"
        data-expanded={expanded ? "true" : "false"}
      >
        {text}
      </pre>
      </Tooltip>
      {long && (
        <button
          type="button"
          className="mt-1 text-[11px] font-medium text-tb-accent hover:underline"
          onClick={() => setExpanded((e) => !e)}
          data-testid="mono-expand"
        >
          {expanded ? "Collapse args" : "Expand args"}
        </button>
      )}
    </div>
  );
}

const ApprovalCard = memo(function ApprovalCard({ approval }: { approval: Approval }) {
  return (
    <div
      className="rounded-md border border-tb-warning/40 bg-tb-warning-soft/50 p-3.5"
      data-testid={`approval-card-${approval.id}`}
      data-risk={approval.risk}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="font-semibold">
          Approval · <code className="font-mono text-[13px]">{approval.toolName}</code>
        </span>
        <Badge tone={riskTone(approval.risk)}>{approval.risk}</Badge>
        <Badge tone={statusTone(approval.status)}>{approval.status}</Badge>
      </div>
      <div className="text-[13px] text-tb-text-muted">{approval.reason}</div>
      {approval.decidedBy && (
        <div className="mt-1.5 text-xs text-tb-text-dim">
          {approval.status} by {approval.decidedBy}
          {approval.note ? ` — ${approval.note}` : ""}
        </div>
      )}
    </div>
  );
});

