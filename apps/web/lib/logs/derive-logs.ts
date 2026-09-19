import type { AgentRun, AuditEvent, TimelineEvent, ToolCall } from "@tracebench/schemas";

export type LogLevel = "debug" | "info" | "warn" | "error" | "audit" | "tool" | "a2a";

export type LogLine = {
  id: string;
  at: string;
  level: LogLevel;
  message: string;
  source: "timeline" | "audit" | "tool";
  eventId?: string;
  fromAgentId?: string;
  toAgentId?: string;
  channel?: string;
  raw?: unknown;
};

function toolById(run: AgentRun, id: string): ToolCall | undefined {
  return run.toolCalls.find((t) => t.id === id);
}

function timelineMessage(run: AgentRun, e: TimelineEvent): Omit<LogLine, "id" | "at" | "source"> {
  switch (e.kind) {
    case "thought":
      return { level: "info", message: e.text, eventId: e.id };
    case "tool": {
      const t = toolById(run, e.toolCallId);
      if (!t) return { level: "tool", message: `tool ${e.toolCallId}`, eventId: e.id };
      const level: LogLevel = t.status === "failed" ? "error" : t.status === "awaiting_approval" ? "warn" : "tool";
      const result = t.result !== undefined ? ` → ${JSON.stringify(t.result).slice(0, 120)}` : "";
      return {
        level,
        message: `${t.toolName} [${t.status}] args=${JSON.stringify(t.args).slice(0, 100)}${result}`,
        eventId: e.id,
        raw: { args: t.args, result: t.result, error: t.error },
      };
    }
    case "approval": {
      const a = run.approvals.find((x) => x.id === e.approvalId);
      return {
        level: a?.status === "pending" ? "warn" : "audit",
        message: a ? `approval ${a.toolName} · ${a.risk} · ${a.status}` : `approval ${e.approvalId}`,
        eventId: e.id,
        raw: a,
      };
    }
    case "outcome":
      return {
        level: e.status === "failed" || e.status === "denied" ? "error" : "info",
        message: `outcome ${e.status}: ${e.summary}`,
        eventId: e.id,
      };
    case "agent_spawn":
      return {
        level: "info",
        message: `spawn ${e.agent.name} (${e.agent.role}) → ${e.childRunId}`,
        eventId: e.id,
        raw: e.agent,
      };
    case "agent_message":
      return {
        level: "a2a",
        message: `${e.fromAgentId} → ${e.toAgentId} [${e.channel}] ${e.payloadSummary}`,
        eventId: e.id,
        fromAgentId: e.fromAgentId,
        toAgentId: e.toAgentId,
        channel: e.channel,
        raw: e,
      };
    case "agent_await":
      return { level: "warn", message: `await child ${e.awaitedRunId}`, eventId: e.id };
    case "agent_join":
      return {
        level: e.outcome === "failed" || e.outcome === "denied" ? "error" : "audit",
        message: `join ${e.childRunId} · ${e.outcome}${e.summary ? `: ${e.summary}` : ""}`,
        eventId: e.id,
      };
  }
}

function auditLevel(type: AuditEvent["type"]): LogLevel {
  if (type === "agent.message") return "a2a";
  if (type.includes("denied") || type.includes("failed")) return "error";
  if (type.includes("approval") || type.startsWith("agent.")) return "audit";
  if (type.includes("tool")) return "tool";
  return "info";
}

export function deriveLogLines(run: AgentRun): LogLine[] {
  const lines: LogLine[] = [];

  for (const e of run.timeline) {
    const partial = timelineMessage(run, e);
    lines.push({
      id: `tl-${e.id}`,
      at: e.at,
      source: "timeline",
      ...partial,
    });
  }

  for (const a of run.auditLog) {
    const isA2a = a.type === "agent.message";
    lines.push({
      id: `au-${a.id}`,
      at: a.timestamp,
      level: auditLevel(a.type),
      message: `[${a.type}] ${a.message}${a.actor ? ` · ${a.actor}` : ""}`,
      source: "audit",
      raw: a.meta,
      ...(isA2a
        ? {
            fromAgentId: typeof a.meta?.fromAgentId === "string" ? a.meta.fromAgentId : undefined,
            toAgentId: typeof a.meta?.toAgentId === "string" ? a.meta.toAgentId : undefined,
          }
        : {}),
    });
  }

  for (const t of run.toolCalls) {
    if (t.result === undefined && t.error === undefined) continue;
    lines.push({
      id: `tc-${t.id}`,
      at: t.endedAt ?? t.startedAt ?? run.createdAt,
      level: t.status === "failed" ? "error" : "debug",
      message: t.error
        ? `${t.toolName} error: ${t.error}`
        : `${t.toolName} result: ${JSON.stringify(t.result).slice(0, 200)}`,
      source: "tool",
      raw: { result: t.result, error: t.error },
    });
  }

  return lines.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function formatLogsTxt(run: AgentRun, lines: LogLine[]): string {
  const header = [
    `# Tracebench logs — ${run.id}`,
    `# title: ${run.title}`,
    `# status: ${run.status}`,
    `# exported: ${new Date().toISOString()}`,
    "",
  ].join("\n");
  const body = lines
    .map((l) => {
      const ts = new Date(l.at).toISOString();
      const a2a =
        l.level === "a2a" && l.fromAgentId
          ? ` ${l.fromAgentId}->${l.toAgentId}`
          : "";
      return `${ts}  ${l.level.toUpperCase().padEnd(5)}${a2a}  ${l.message}`;
    })
    .join("\n");
  return `${header}${body}\n`;
}

export function formatLogsJsonl(run: AgentRun, lines: LogLine[]): string {
  return (
    lines
      .map((l) =>
        JSON.stringify({
          runId: run.id,
          at: l.at,
          level: l.level,
          message: l.message,
          source: l.source,
          eventId: l.eventId,
          fromAgentId: l.fromAgentId,
          toAgentId: l.toAgentId,
          channel: l.channel,
          raw: l.raw,
        }),
      )
      .join("\n") + "\n"
  );
}

export function formatAuditTxt(run: AgentRun): string {
  const header = [
    `# Tracebench audit — ${run.id}`,
    `# title: ${run.title}`,
    `# exported: ${new Date().toISOString()}`,
    "",
  ].join("\n");
  const body = run.auditLog
    .map((a) => `${a.timestamp}  ${a.type.padEnd(22)}  ${a.message}  (${a.actor})`)
    .join("\n");
  return `${header}${body}\n`;
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
