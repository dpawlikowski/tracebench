import type { AgentRun } from "@tracebench/schemas";
import type { DomainEvent } from "@tracebench/domain";
import type { OpsSpan, OpsSpanName, OpsRunSpanSummary } from "./types";

function emptyByName(): Record<OpsSpanName, number> {
  return { invoke_agent: 0, chat: 0, execute_tool: 0, tool_approval: 0 };
}

export function countByName(spans: OpsSpan[]): Record<OpsSpanName, number> {
  const by = emptyByName();
  for (const s of spans) by[s.name] += 1;
  return by;
}

function toolStatus(status: string): OpsSpan["status"] {
  if (status === "failed" || status === "denied" || status === "cancelled") return "error";
  if (status === "succeeded") return "ok";
  return "unset";
}

/**
 * Mapping from folded AgentRun:
 * invoke_agent ← run (+ agent_spawn)
 * chat         ← thoughts (+ agent_message)
 * execute_tool ← toolCalls
 * tool_approval← approvals
 */
export function projectSpansFromRun(run: AgentRun): OpsSpan[] {
  const spans: OpsSpan[] = [];
  const rootId = `span_invoke_${run.id}`;

  spans.push({
    id: rootId,
    name: "invoke_agent",
    runId: run.id,
    startTime: run.startedAt ?? run.createdAt,
    endTime: run.endedAt,
    status:
      run.status === "failed" || run.status === "denied" || run.status === "cancelled"
        ? "error"
        : run.status === "succeeded"
          ? "ok"
          : "unset",
    attributes: {
      "gen_ai.operation.name": "invoke_agent",
      agent_name: run.agentName,
      run_id: run.id,
      summary: run.title,
    },
  });

  for (const ev of run.timeline) {
    if (ev.kind === "thought") {
      spans.push({
        id: `span_chat_${ev.id}`,
        name: "chat",
        runId: run.id,
        parentSpanId: rootId,
        startTime: ev.at,
        endTime: ev.at,
        status: "ok",
        attributes: {
          "gen_ai.operation.name": "chat",
          run_id: run.id,
          summary: ev.text.slice(0, 160),
        },
      });
    } else if (ev.kind === "agent_message") {
      spans.push({
        id: `span_chat_${ev.id}`,
        name: "chat",
        runId: run.id,
        parentSpanId: rootId,
        startTime: ev.at,
        endTime: ev.at,
        status: ev.level === "error" ? "error" : "ok",
        attributes: {
          "gen_ai.operation.name": "chat",
          run_id: run.id,
          summary: ev.payloadSummary.slice(0, 160),
          agent_name: `${ev.fromAgentId}→${ev.toAgentId}`,
        },
      });
    } else if (ev.kind === "agent_spawn") {
      spans.push({
        id: `span_invoke_${ev.id}`,
        name: "invoke_agent",
        runId: run.id,
        parentSpanId: rootId,
        startTime: ev.at,
        endTime: ev.at,
        status: "ok",
        attributes: {
          "gen_ai.operation.name": "invoke_agent",
          run_id: ev.childRunId,
          agent_name: ev.agent.name,
          summary: `spawn ${ev.agent.role}`,
        },
      });
    }
  }

  for (const tc of run.toolCalls) {
    spans.push({
      id: `span_tool_${tc.id}`,
      name: "execute_tool",
      runId: run.id,
      parentSpanId: rootId,
      startTime: tc.startedAt,
      endTime: tc.endedAt,
      status: toolStatus(tc.status),
      attributes: {
        "gen_ai.operation.name": "execute_tool",
        tool_name: tc.toolName,
        risk: tc.risk,
        run_id: run.id,
        ...(tc.tokensIn !== undefined ? { "gen_ai.usage.input_tokens": tc.tokensIn } : {}),
        ...(tc.tokensOut !== undefined ? { "gen_ai.usage.output_tokens": tc.tokensOut } : {}),
        ...(tc.costUsd !== undefined ? { "gen_ai.usage.cost_usd": tc.costUsd } : {}),
      },
    });
  }

  for (const ap of run.approvals) {
    spans.push({
      id: `span_approval_${ap.id}`,
      name: "tool_approval",
      runId: run.id,
      parentSpanId: rootId,
      startTime: ap.requestedAt,
      endTime: ap.decidedAt,
      status: ap.status === "denied" ? "error" : ap.status === "approved" ? "ok" : "unset",
      attributes: {
        "gen_ai.operation.name": "tool_approval",
        approval_id: ap.id,
        tool_name: ap.toolName,
        risk: ap.risk,
        decision: ap.status,
        run_id: run.id,
        summary: ap.reason.slice(0, 160),
      },
    });
  }

  spans.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.id.localeCompare(b.id));
  return spans;
}

/** Project from raw domain events (worker / OTLP path later). */
export function projectSpansFromEvents(events: DomainEvent[], runId: string): OpsSpan[] {
  const spans: OpsSpan[] = [];
  const open = new Map<string, OpsSpan>();

  for (const ev of events) {
    switch (ev.type) {
      case "RunStarted": {
        const id = `span_invoke_${ev.runId}`;
        const span: OpsSpan = {
          id,
          name: "invoke_agent",
          runId: ev.runId,
          startTime: ev.at,
          status: "unset",
          attributes: {
            "gen_ai.operation.name": "invoke_agent",
            agent_name: ev.agentName ?? "OpsAgent",
            run_id: ev.runId,
            summary: ev.title,
          },
        };
        open.set(id, span);
        spans.push(span);
        break;
      }
      case "ThoughtEmitted": {
        spans.push({
          id: `span_chat_${ev.id}`,
          name: "chat",
          runId,
          parentSpanId: `span_invoke_${runId}`,
          startTime: ev.at,
          endTime: ev.at,
          status: "ok",
          attributes: {
            "gen_ai.operation.name": "chat",
            run_id: runId,
            summary: ev.text.slice(0, 160),
          },
        });
        break;
      }
      case "ToolCallStarted": {
        const id = `span_tool_${ev.toolCall.id}`;
        const span: OpsSpan = {
          id,
          name: "execute_tool",
          runId,
          parentSpanId: `span_invoke_${runId}`,
          startTime: ev.at,
          status: "unset",
          attributes: {
            "gen_ai.operation.name": "execute_tool",
            tool_name: ev.toolCall.toolName,
            risk: ev.toolCall.risk,
            run_id: runId,
          },
        };
        open.set(id, span);
        spans.push(span);
        break;
      }
      case "ToolCallFinished": {
        const id = `span_tool_${ev.toolCallId}`;
        const span = open.get(id);
        if (span) {
          span.endTime = ev.at;
          span.status = toolStatus(ev.status);
          span.attributes = {
            ...span.attributes,
            ...(ev.tokensIn !== undefined ? { "gen_ai.usage.input_tokens": ev.tokensIn } : {}),
            ...(ev.tokensOut !== undefined ? { "gen_ai.usage.output_tokens": ev.tokensOut } : {}),
            ...(ev.costUsd !== undefined ? { "gen_ai.usage.cost_usd": ev.costUsd } : {}),
          };
          open.delete(id);
        }
        break;
      }
      case "ApprovalRequested": {
        const id = `span_approval_${ev.approval.id}`;
        const span: OpsSpan = {
          id,
          name: "tool_approval",
          runId,
          parentSpanId: `span_invoke_${runId}`,
          startTime: ev.at,
          status: "unset",
          attributes: {
            "gen_ai.operation.name": "tool_approval",
            approval_id: ev.approval.id,
            tool_name: ev.approval.toolName,
            risk: ev.approval.risk,
            run_id: runId,
            summary: ev.approval.reason.slice(0, 160),
          },
        };
        open.set(id, span);
        spans.push(span);
        break;
      }
      case "ApprovalDecided": {
        const id = `span_approval_${ev.approvalId}`;
        const span = open.get(id);
        if (span) {
          span.endTime = ev.at;
          span.status = ev.decision === "denied" ? "error" : "ok";
          span.attributes = { ...span.attributes, decision: ev.decision };
          open.delete(id);
        }
        break;
      }
      case "RunCompleted":
      case "RunFailed": {
        const id = `span_invoke_${runId}`;
        const span = open.get(id);
        if (span) {
          span.endTime = ev.at;
          span.status =
            ev.type === "RunFailed" ||
            (ev.type === "RunCompleted" && (ev.status === "denied" || ev.status === "cancelled"))
              ? "error"
              : "ok";
          open.delete(id);
        }
        break;
      }
      case "AgentSpawned": {
        spans.push({
          id: `span_invoke_${ev.id}`,
          name: "invoke_agent",
          runId,
          parentSpanId: `span_invoke_${runId}`,
          startTime: ev.at,
          endTime: ev.at,
          status: "ok",
          attributes: {
            "gen_ai.operation.name": "invoke_agent",
            run_id: ev.childRunId,
            agent_name: ev.agent.name,
            summary: `spawn ${ev.agent.role}`,
          },
        });
        break;
      }
      case "AgentMessage": {
        spans.push({
          id: `span_chat_${ev.id}`,
          name: "chat",
          runId,
          parentSpanId: `span_invoke_${runId}`,
          startTime: ev.at,
          endTime: ev.at,
          status: ev.level === "error" ? "error" : "ok",
          attributes: {
            "gen_ai.operation.name": "chat",
            run_id: runId,
            summary: ev.payloadSummary.slice(0, 160),
            agent_name: `${ev.fromAgentId}→${ev.toAgentId}`,
          },
        });
        break;
      }
      default:
        break;
    }
  }

  spans.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.id.localeCompare(b.id));
  return spans;
}

export function summarizeRun(run: AgentRun, spans: OpsSpan[]): OpsRunSpanSummary {
  return {
    runId: run.id,
    title: run.title,
    status: run.status,
    spanCount: spans.length,
    byName: countByName(spans),
  };
}
