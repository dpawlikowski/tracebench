import type { AgentRun, AgentRef, AgentMessageChannel, Approval, RunStatus, ToolCall, ToolCallStatus } from "@tracebench/schemas";

/**
 * Domain events for an event-sourced AgentRun.
 * UI timelines / audit logs are projections of these events via `reduce`.
 */
export type DomainEvent =
  | {
      type: "RunStarted";
      at: string;
      runId: string;
      title: string;
      goal: string;
      agentName?: string;
      tags?: string[];
    }
  | {
      type: "ThoughtEmitted";
      at: string;
      /** Timeline event id (stable for SSE replay visibility). */
      id: string;
      text: string;
    }
  | {
      type: "ToolCallStarted";
      at: string;
      /** Optional timeline event id when projected from fixture timeline. */
      id?: string;
      toolCall: ToolCall;
    }
  | {
      type: "ToolCallFinished";
      at: string;
      toolCallId: string;
      status: Extract<ToolCallStatus, "succeeded" | "failed" | "denied" | "cancelled">;
      result?: unknown;
      error?: string;
      latencyMs?: number;
      costUsd?: number;
      tokensIn?: number;
      tokensOut?: number;
    }
  | {
      type: "ApprovalRequested";
      at: string;
      /** Optional timeline event id when projected from fixture timeline. */
      id?: string;
      approval: Approval;
    }
  | {
      type: "ApprovalDecided";
      at: string;
      approvalId: string;
      decision: "approved" | "denied";
      decidedBy: string;
      note?: string;
    }
  | {
      type: "RunCompleted";
      at: string;
      /** Optional timeline outcome id. */
      id?: string;
      status: Extract<RunStatus, "succeeded" | "denied" | "cancelled">;
      summary: string;
    }
  | {
      type: "RunFailed";
      at: string;
      id?: string;
      error: string;
      summary?: string;
    }
  | {
      type: "AgentSpawned";
      at: string;
      id: string;
      parentRunId: string;
      childRunId: string;
      agent: AgentRef;
    }
  | {
      type: "AgentMessage";
      at: string;
      id: string;
      fromAgentId: string;
      toAgentId: string;
      channel: AgentMessageChannel;
      payloadSummary: string;
      level?: "debug" | "info" | "warn" | "error";
    }
  | {
      type: "AgentAwait";
      at: string;
      id: string;
      waiterRunId: string;
      awaitedRunId: string;
      waiterAgentId?: string;
    }
  | {
      type: "AgentJoined";
      at: string;
      id: string;
      parentRunId: string;
      childRunId: string;
      outcome: Extract<RunStatus, "succeeded" | "failed" | "denied" | "cancelled">;
      summary?: string;
    };

export type RunState = AgentRun;

export function emptyRun(partial: Pick<AgentRun, "id" | "title" | "goal" | "createdAt"> & Partial<AgentRun>): RunState {
  return {
    agentName: "OpsAgent",
    status: "queued",
    tags: [],
    toolCalls: [],
    approvals: [],
    auditLog: [],
    timeline: [],
    childRunIds: [],
    agents: [],
    metrics: {
      totalLatencyMs: 0,
      totalCostUsd: 0,
      tokensIn: 0,
      tokensOut: 0,
      toolCallCount: 0,
      approvalCount: 0,
      deniedCount: 0,
      failedToolCount: 0,
    },
    replayPlan: [],
    ...partial,
  };
}
