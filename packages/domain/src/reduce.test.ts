import { describe, it, expect } from "vitest";
import type { AgentRun } from "@tracebench/schemas";
import { emptyRun, type DomainEvent } from "./events";
import { decideApproval } from "./commands/decideApproval";
import { domainEventTimelineId, fold, reduce, timelineEventToDomain } from "./reduce";

const BASE_AT = "2026-09-19T18:00:00.000Z";

function awaitingRun(): AgentRun {
  return {
    id: "run_live_approve",
    title: "Emergency ledger top-up",
    goal: "Top up",
    agentName: "OpsAgent",
    status: "awaiting_approval",
    createdAt: BASE_AT,
    startedAt: BASE_AT,
    tags: ["demo"],
    toolCalls: [
      {
        id: "tc_lv_3",
        runId: "run_live_approve",
        toolName: "execute_payment",
        risk: "high",
        status: "awaiting_approval",
        args: { amountUsd: 50000 },
        startedAt: BASE_AT,
        approvalId: "ap_lv_2",
        costUsd: 0,
        tokensIn: 0,
        tokensOut: 0,
      },
    ],
    approvals: [
      {
        id: "ap_lv_2",
        runId: "run_live_approve",
        toolCallId: "tc_lv_3",
        toolName: "execute_payment",
        risk: "high",
        reason: "Irreversible",
        argsPreview: { amountUsd: 50000 },
        status: "pending",
        requestedAt: BASE_AT,
      },
    ],
    auditLog: [],
    timeline: [
      { kind: "approval", id: "ev_lv_a2", at: BASE_AT, approvalId: "ap_lv_2" },
    ],
    metrics: {
      totalLatencyMs: 7000,
      totalCostUsd: 0.013,
      tokensIn: 780,
      tokensOut: 330,
      toolCallCount: 1,
      approvalCount: 0,
      deniedCount: 0,
      failedToolCount: 0,
    },
    replayPlan: [],
  };
}

describe("reduce", () => {
  it("RunStarted seeds a running run", () => {
    const seed = emptyRun({
      id: "x",
      title: "t",
      goal: "g",
      createdAt: BASE_AT,
    });
    const next = reduce(seed, {
      type: "RunStarted",
      at: BASE_AT,
      runId: "run_1",
      title: "Pay vendor",
      goal: "Pay",
    });
    expect(next.id).toBe("run_1");
    expect(next.status).toBe("running");
    expect(next.auditLog[0]?.type).toBe("run.started");
  });

  it("ThoughtEmitted appends timeline thought", () => {
    const state = emptyRun({
      id: "run_1",
      title: "t",
      goal: "g",
      createdAt: BASE_AT,
      status: "running",
    });
    const next = reduce(state, {
      type: "ThoughtEmitted",
      id: "ev_1",
      at: BASE_AT,
      text: "Thinking…",
    });
    expect(next.timeline).toHaveLength(1);
    expect(next.timeline[0]).toMatchObject({ kind: "thought", text: "Thinking…" });
    // immutability
    expect(state.timeline).toHaveLength(0);
  });

  it("ApprovalRequested flips status and tool", () => {
    const state = emptyRun({
      id: "run_1",
      title: "t",
      goal: "g",
      createdAt: BASE_AT,
      status: "running",
      toolCalls: [
        {
          id: "tc_1",
          runId: "run_1",
          toolName: "execute_payment",
          risk: "high",
          status: "running",
          args: {},
          startedAt: BASE_AT,
        },
      ],
    });
    const next = reduce(state, {
      type: "ApprovalRequested",
      id: "ev_a",
      at: BASE_AT,
      approval: {
        id: "ap_1",
        runId: "run_1",
        toolCallId: "tc_1",
        toolName: "execute_payment",
        risk: "high",
        reason: "funds",
        argsPreview: {},
        status: "pending",
        requestedAt: BASE_AT,
      },
    });
    expect(next.status).toBe("awaiting_approval");
    expect(next.toolCalls[0]?.status).toBe("awaiting_approval");
    expect(next.approvals).toHaveLength(1);
  });
});

describe("decideApproval + fold", () => {
  it("approve path settles tool and succeeds run", () => {
    const state = awaitingRun();
    const result = decideApproval(state, {
      runId: state.id,
      approvalId: "ap_lv_2",
      decision: "approved",
      decidedBy: "dominik.pawlikowski",
      note: "ok",
      now: "2026-09-19T18:10:00.000Z",
      nextId: (p) => `${p}_fixed`,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.events.map((e) => e.type)).toEqual([
      "ApprovalDecided",
      "ToolCallFinished",
      "RunCompleted",
    ]);

    const next = fold(state, result.events);
    expect(next.status).toBe("succeeded");
    expect(next.approvals[0]?.status).toBe("approved");
    expect(next.approvals[0]?.decidedBy).toBe("dominik.pawlikowski");
    expect(next.toolCalls[0]?.status).toBe("succeeded");
    expect(next.toolCalls[0]?.result).toMatchObject({ state: "settled" });
    expect(next.metrics.totalCostUsd).toBeCloseTo(0.028);
    expect(next.auditLog.some((a) => a.type === "approval.approved")).toBe(true);
    expect(next.auditLog.some((a) => a.type === "run.completed")).toBe(true);
    expect(next.timeline.some((t) => t.kind === "outcome")).toBe(true);
  });

  it("deny path marks tool denied and run denied", () => {
    const state = awaitingRun();
    const result = decideApproval(state, {
      runId: state.id,
      approvalId: "ap_lv_2",
      decision: "denied",
      now: "2026-09-19T18:10:00.000Z",
      nextId: (p) => `${p}_fixed`,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const next = fold(state, result.events);
    expect(next.status).toBe("denied");
    expect(next.approvals[0]?.status).toBe("denied");
    expect(next.toolCalls[0]?.status).toBe("denied");
    expect(next.metrics.deniedCount).toBe(1);
    expect(next.auditLog.some((a) => a.type === "approval.denied")).toBe(true);
    expect(next.auditLog.some((a) => a.type === "run.cancelled")).toBe(true);
  });

  it("rejects non-pending approval", () => {
    const state = awaitingRun();
    state.approvals[0]!.status = "approved";
    const result = decideApproval(state, {
      runId: state.id,
      approvalId: "ap_lv_2",
      decision: "approved",
    });
    expect(result.ok).toBe(false);
  });
});

describe("timelineEventToDomain", () => {
  it("maps thought / tool / approval / outcome", () => {
    const run = awaitingRun();
    const thought = timelineEventToDomain(
      { kind: "thought", id: "ev_t", at: BASE_AT, text: "hi" },
      run,
    );
    expect(thought).toMatchObject({ type: "ThoughtEmitted", id: "ev_t" });

    const approval = timelineEventToDomain(run.timeline[0]!, run);
    expect(approval).toMatchObject({ type: "ApprovalRequested", id: "ev_lv_a2" });

    const outcome: DomainEvent | null = timelineEventToDomain(
      {
        kind: "outcome",
        id: "ev_out",
        at: BASE_AT,
        status: "succeeded",
        summary: "done",
      },
      run,
    );
    expect(outcome).toMatchObject({ type: "RunCompleted", id: "ev_out" });
    expect(domainEventTimelineId(outcome!)).toBe("ev_out");
  });
});

describe("nested agent events", () => {
  it("spawns child, messages, awaits, joins", () => {
    const start: DomainEvent = {
      type: "RunStarted",
      at: BASE_AT,
      runId: "run_pipeline_ops",
      title: "Ops pipeline",
      goal: "Plan → research → execute",
      agentName: "Planner",
      tags: ["multi-agent"],
    };
    const spawn: DomainEvent = {
      type: "AgentSpawned",
      at: "2026-09-19T18:00:01.000Z",
      id: "ev_spawn_r",
      parentRunId: "run_pipeline_ops",
      childRunId: "run_child_researcher",
      agent: { id: "ag_researcher", name: "Researcher", role: "researcher" },
    };
    const msg: DomainEvent = {
      type: "AgentMessage",
      at: "2026-09-19T18:00:02.000Z",
      id: "ev_msg_1",
      fromAgentId: "ag_planner",
      toAgentId: "ag_researcher",
      channel: "task",
      payloadSummary: "Gather ACME invoice policy",
      level: "info",
    };
    const awaitEv: DomainEvent = {
      type: "AgentAwait",
      at: "2026-09-19T18:00:03.000Z",
      id: "ev_await_1",
      waiterRunId: "run_pipeline_ops",
      awaitedRunId: "run_child_researcher",
      waiterAgentId: "ag_planner",
    };
    const join: DomainEvent = {
      type: "AgentJoined",
      at: "2026-09-19T18:00:10.000Z",
      id: "ev_join_1",
      parentRunId: "run_pipeline_ops",
      childRunId: "run_child_researcher",
      outcome: "succeeded",
      summary: "Policy brief ready",
    };

    const folded = fold(emptyRun({ id: "run_pipeline_ops", title: "x", goal: "y", createdAt: BASE_AT }), [
      start,
      spawn,
      msg,
      awaitEv,
      join,
    ]);

    expect(folded.childRunIds).toEqual(["run_child_researcher"]);
    expect(folded.agents?.map((a) => a.id)).toContain("ag_researcher");
    expect(folded.timeline.map((e) => e.kind)).toEqual([
      "agent_spawn",
      "agent_message",
      "agent_await",
      "agent_join",
    ]);
    expect(folded.auditLog.some((a) => a.type === "agent.message")).toBe(true);
  });
});
