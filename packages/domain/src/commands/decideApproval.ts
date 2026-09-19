import type { DomainEvent, RunState } from "../events";

export type DecideApprovalCommand = {
  runId: string;
  approvalId: string;
  decision: "approved" | "denied";
  decidedBy?: string;
  note?: string;
  /** Injectable clock for tests. */
  now?: string;
  /** Injectable id factory for tests. */
  nextId?: (prefix: string) => string;
};

export type DecideApprovalResult =
  | { ok: true; events: DomainEvent[] }
  | { ok: false; error: string };

/**
 * HITL command: decide a pending approval → append domain events.
 * Same path for fixture demo and future live AgentTransport.
 */
export function decideApproval(state: RunState, cmd: DecideApprovalCommand): DecideApprovalResult {
  if (state.id !== cmd.runId) {
    return { ok: false, error: "Run id mismatch" };
  }

  const approval = state.approvals.find((a) => a.id === cmd.approvalId);
  if (!approval) {
    return { ok: false, error: "Approval not found" };
  }
  if (approval.status !== "pending") {
    return { ok: false, error: "Approval is not pending" };
  }

  const now = cmd.now ?? new Date().toISOString();
  const nextId =
    cmd.nextId ??
    ((prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const decidedBy = cmd.decidedBy ?? "dominik.pawlikowski";
  const events: DomainEvent[] = [];

  events.push({
    type: "ApprovalDecided",
    at: now,
    approvalId: cmd.approvalId,
    decision: cmd.decision,
    decidedBy,
    ...(cmd.note !== undefined ? { note: cmd.note } : {}),
  });

  if (cmd.decision === "approved") {
    events.push({
      type: "ToolCallFinished",
      at: now,
      toolCallId: approval.toolCallId,
      status: "succeeded",
      latencyMs: 1800,
      costUsd: 0.015,
      tokensIn: 400,
      tokensOut: 80,
      result: {
        paymentId: `pay_live_${Date.now()}`,
        state: "settled",
        approvedBy: decidedBy,
      },
    });
    events.push({
      type: "RunCompleted",
      at: now,
      id: nextId("ev_live_out"),
      status: "succeeded",
      summary: `${approval.toolName} approved and settled.`,
    });
  } else {
    events.push({
      type: "ToolCallFinished",
      at: now,
      toolCallId: approval.toolCallId,
      status: "denied",
    });
    events.push({
      type: "RunCompleted",
      at: now,
      id: nextId("ev_live_out"),
      status: "denied",
      summary: `${approval.toolName} denied by operator.`,
    });
  }

  return { ok: true, events };
}
