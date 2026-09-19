import type { AuditEvent } from "@tracebench/schemas";
import type { DomainEvent, RunState } from "./events";
import { emptyRun } from "./events";

function audit(
  runId: string,
  type: AuditEvent["type"],
  at: string,
  message: string,
  actor: AuditEvent["actor"] = "system",
  meta?: Record<string, unknown>,
): AuditEvent {
  return {
    id: `au_${type.replace(".", "_")}_${at.replace(/\D/g, "").slice(-10)}_${Math.random().toString(36).slice(2, 6)}`,
    runId,
    type,
    timestamp: at,
    actor,
    message,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Pure fold: apply one domain event to run state.
 * Never mutates `state` — always returns a new object (deep enough for nested arrays).
 */
export function reduce(state: RunState, event: DomainEvent): RunState {
  switch (event.type) {
    case "RunStarted": {
      const next = emptyRun({
        id: event.runId,
        title: event.title,
        goal: event.goal,
        createdAt: event.at,
        startedAt: event.at,
        agentName: event.agentName ?? "OpsAgent",
        tags: event.tags ?? [],
        status: "running",
      });
      next.auditLog = [audit(event.runId, "run.started", event.at, "Run started")];
      return next;
    }

    case "ThoughtEmitted": {
      return {
        ...state,
        timeline: [
          ...state.timeline,
          { kind: "thought", id: event.id, at: event.at, text: event.text },
        ],
      };
    }

    case "ToolCallStarted": {
      const exists = state.toolCalls.some((t) => t.id === event.toolCall.id);
      const toolCalls = exists
        ? state.toolCalls.map((t) => (t.id === event.toolCall.id ? event.toolCall : t))
        : [...state.toolCalls, event.toolCall];
      const timeline = event.id
        ? [
            ...state.timeline,
            { kind: "tool" as const, id: event.id, at: event.at, toolCallId: event.toolCall.id },
          ]
        : state.timeline;
      return {
        ...state,
        status: state.status === "queued" ? "running" : state.status,
        toolCalls,
        timeline,
        metrics: {
          ...state.metrics,
          toolCallCount: toolCalls.length,
        },
        auditLog: [
          ...state.auditLog,
          audit(state.id, "tool.started", event.at, event.toolCall.toolName, "agent", {
            toolCallId: event.toolCall.id,
          }),
        ],
      };
    }

    case "ToolCallFinished": {
      const toolCalls = state.toolCalls.map((t) => {
        if (t.id !== event.toolCallId) return t;
        return {
          ...t,
          status: event.status,
          endedAt: event.at,
          ...(event.result !== undefined ? { result: event.result } : {}),
          ...(event.error !== undefined ? { error: event.error } : {}),
          ...(event.latencyMs !== undefined ? { latencyMs: event.latencyMs } : {}),
          costUsd: (t.costUsd ?? 0) + (event.costUsd ?? 0),
          tokensIn: (t.tokensIn ?? 0) + (event.tokensIn ?? 0),
          tokensOut: (t.tokensOut ?? 0) + (event.tokensOut ?? 0),
        };
      });
      const tool = toolCalls.find((t) => t.id === event.toolCallId);
      const auditType =
        event.status === "failed"
          ? ("tool.failed" as const)
          : event.status === "succeeded"
            ? ("tool.completed" as const)
            : ("tool.completed" as const);
      return {
        ...state,
        toolCalls,
        metrics: {
          ...state.metrics,
          totalCostUsd: state.metrics.totalCostUsd + (event.costUsd ?? 0),
          tokensIn: state.metrics.tokensIn + (event.tokensIn ?? 0),
          tokensOut: state.metrics.tokensOut + (event.tokensOut ?? 0),
          failedToolCount:
            state.metrics.failedToolCount + (event.status === "failed" ? 1 : 0),
        },
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            auditType,
            event.at,
            tool ? `${tool.toolName} ${event.status}` : `tool ${event.status}`,
            "agent",
            { toolCallId: event.toolCallId },
          ),
        ],
      };
    }

    case "ApprovalRequested": {
      const exists = state.approvals.some((a) => a.id === event.approval.id);
      const approvals = exists
        ? state.approvals.map((a) => (a.id === event.approval.id ? event.approval : a))
        : [...state.approvals, event.approval];
      const toolCalls = state.toolCalls.map((t) =>
        t.id === event.approval.toolCallId
          ? { ...t, status: "awaiting_approval" as const, approvalId: event.approval.id }
          : t,
      );
      const timeline = event.id
        ? [
            ...state.timeline,
            {
              kind: "approval" as const,
              id: event.id,
              at: event.at,
              approvalId: event.approval.id,
            },
          ]
        : state.timeline;
      return {
        ...state,
        status: "awaiting_approval",
        approvals,
        toolCalls,
        timeline,
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            "approval.requested",
            event.at,
            `Approval for ${event.approval.toolName}`,
            "system",
            { approvalId: event.approval.id },
          ),
        ],
      };
    }

    case "ApprovalDecided": {
      const approval = state.approvals.find((a) => a.id === event.approvalId);
      const approvals = state.approvals.map((a) =>
        a.id === event.approvalId
          ? {
              ...a,
              status: event.decision,
              decidedAt: event.at,
              decidedBy: event.decidedBy,
              ...(event.note !== undefined ? { note: event.note } : {}),
            }
          : a,
      );
      const auditType =
        event.decision === "approved" ? ("approval.approved" as const) : ("approval.denied" as const);
      return {
        ...state,
        approvals,
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            auditType,
            event.at,
            `${approval?.toolName ?? "tool"} ${event.decision} by ${event.decidedBy}${
              event.note ? ` — ${event.note}` : ""
            }`,
            "human",
            { approvalId: event.approvalId },
          ),
        ],
      };
    }

    case "RunCompleted": {
      const timeline = event.id
        ? [
            ...state.timeline,
            {
              kind: "outcome" as const,
              id: event.id,
              at: event.at,
              status: event.status,
              summary: event.summary,
            },
          ]
        : state.timeline;
      const approvalCount = state.approvals.filter((a) => a.status === "approved").length;
      const deniedCount =
        event.status === "denied"
          ? state.metrics.deniedCount + 1
          : state.metrics.deniedCount;
      return {
        ...state,
        status: event.status,
        endedAt: event.at,
        timeline,
        metrics: {
          ...state.metrics,
          approvalCount,
          deniedCount,
        },
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            event.status === "denied" ? "run.cancelled" : "run.completed",
            event.at,
            event.status === "denied"
              ? "Run denied at high-risk gate"
              : event.status === "cancelled"
                ? "Run cancelled"
                : "Run succeeded",
            "system",
          ),
        ],
      };
    }

    case "RunFailed": {
      const timeline = event.id
        ? [
            ...state.timeline,
            {
              kind: "outcome" as const,
              id: event.id,
              at: event.at,
              status: "failed" as const,
              summary: event.summary ?? event.error,
            },
          ]
        : state.timeline;
      return {
        ...state,
        status: "failed",
        endedAt: event.at,
        error: event.error,
        timeline,
        auditLog: [
          ...state.auditLog,
          audit(state.id, "run.failed", event.at, event.error, "system"),
        ],
      };
    }


    case "AgentSpawned": {
      const prevAgents = state.agents ?? [];
      const agents = prevAgents.some((a) => a.id === event.agent.id)
        ? prevAgents
        : [...prevAgents, event.agent];
      const prevChildren = state.childRunIds ?? [];
      const childRunIds = prevChildren.includes(event.childRunId)
        ? prevChildren
        : [...prevChildren, event.childRunId];
      return {
        ...state,
        agents,
        childRunIds,
        timeline: [
          ...state.timeline,
          {
            kind: "agent_spawn" as const,
            id: event.id,
            at: event.at,
            childRunId: event.childRunId,
            agent: event.agent,
          },
        ],
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            "agent.spawned",
            event.at,
            `Spawned ${event.agent.name} → ${event.childRunId}`,
            "system",
            { childRunId: event.childRunId, agentId: event.agent.id },
          ),
        ],
      };
    }

    case "AgentMessage": {
      return {
        ...state,
        timeline: [
          ...state.timeline,
          {
            kind: "agent_message" as const,
            id: event.id,
            at: event.at,
            fromAgentId: event.fromAgentId,
            toAgentId: event.toAgentId,
            channel: event.channel,
            payloadSummary: event.payloadSummary,
            level: event.level ?? "info",
          },
        ],
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            "agent.message",
            event.at,
            `${event.fromAgentId} → ${event.toAgentId} [${event.channel}] ${event.payloadSummary}`,
            "agent",
            {
              fromAgentId: event.fromAgentId,
              toAgentId: event.toAgentId,
              channel: event.channel,
            },
          ),
        ],
      };
    }

    case "AgentAwait": {
      return {
        ...state,
        timeline: [
          ...state.timeline,
          {
            kind: "agent_await" as const,
            id: event.id,
            at: event.at,
            awaitedRunId: event.awaitedRunId,
            ...(event.waiterAgentId ? { waiterAgentId: event.waiterAgentId } : {}),
          },
        ],
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            "agent.await",
            event.at,
            `Awaiting child ${event.awaitedRunId}`,
            "system",
            { awaitedRunId: event.awaitedRunId },
          ),
        ],
      };
    }

    case "AgentJoined": {
      return {
        ...state,
        timeline: [
          ...state.timeline,
          {
            kind: "agent_join" as const,
            id: event.id,
            at: event.at,
            childRunId: event.childRunId,
            outcome: event.outcome,
            ...(event.summary ? { summary: event.summary } : {}),
          },
        ],
        auditLog: [
          ...state.auditLog,
          audit(
            state.id,
            "agent.joined",
            event.at,
            `Child ${event.childRunId} joined · ${event.outcome}`,
            "system",
            { childRunId: event.childRunId, outcome: event.outcome },
          ),
        ],
      };
    }

    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

/** Fold a sequence of events onto an initial state. */
export function fold(initial: RunState, events: readonly DomainEvent[]): RunState {
  return events.reduce((s, e) => reduce(s, e), initial);
}

/**
 * Map a fixture timeline event into a domain event for SSE replay.
 * Does not mutate run documents — stream-only projection helper.
 */
export function timelineEventToDomain(
  e: RunState["timeline"][number],
  run: RunState,
): DomainEvent | null {
  switch (e.kind) {
    case "thought":
      return { type: "ThoughtEmitted", id: e.id, at: e.at, text: e.text };
    case "tool": {
      const toolCall = run.toolCalls.find((t) => t.id === e.toolCallId);
      if (!toolCall) return null;
      return {
        type: "ToolCallStarted",
        id: e.id,
        at: e.at,
        toolCall: { ...toolCall },
      };
    }
    case "approval": {
      const approval = run.approvals.find((a) => a.id === e.approvalId);
      if (!approval) return null;
      return {
        type: "ApprovalRequested",
        id: e.id,
        at: e.at,
        approval: { ...approval },
      };
    }
    case "outcome":
      if (e.status === "failed") {
        return {
          type: "RunFailed",
          id: e.id,
          at: e.at,
          error: e.summary,
          summary: e.summary,
        };
      }
      if (e.status === "succeeded" || e.status === "denied" || e.status === "cancelled") {
        return {
          type: "RunCompleted",
          id: e.id,
          at: e.at,
          status: e.status,
          summary: e.summary,
        };
      }
      return null;
    case "agent_spawn":
      return {
        type: "AgentSpawned",
        id: e.id,
        at: e.at,
        parentRunId: run.id,
        childRunId: e.childRunId,
        agent: e.agent,
      };
    case "agent_message":
      return {
        type: "AgentMessage",
        id: e.id,
        at: e.at,
        fromAgentId: e.fromAgentId,
        toAgentId: e.toAgentId,
        channel: e.channel,
        payloadSummary: e.payloadSummary,
        level: e.level,
      };
    case "agent_await":
      return {
        type: "AgentAwait",
        id: e.id,
        at: e.at,
        waiterRunId: run.id,
        awaitedRunId: e.awaitedRunId,
        waiterAgentId: e.waiterAgentId,
      };
    case "agent_join":
      return {
        type: "AgentJoined",
        id: e.id,
        at: e.at,
        parentRunId: run.id,
        childRunId: e.childRunId,
        outcome: e.outcome,
        summary: e.summary,
      };
    default:
      return null;
  }
}

/** Stable id used by the UI to reveal timeline rows during SSE replay. */
export function domainEventTimelineId(event: DomainEvent): string | undefined {
  switch (event.type) {
    case "ThoughtEmitted":
      return event.id;
    case "ToolCallStarted":
    case "ApprovalRequested":
    case "RunCompleted":
    case "RunFailed":
    case "AgentSpawned":
    case "AgentMessage":
    case "AgentAwait":
    case "AgentJoined":
      return event.id;
    default:
      return undefined;
  }
}
