import { describe, it, expect } from "vitest";
import {
  AgentRunSchema,
  ToolCallSchema,
  ApprovalSchema,
  EvalCaseSchema,
  RunMetricsSchema,
  RiskTierSchema,
  StreamFrameV1Schema,
} from "./index";

describe("RiskTierSchema", () => {
  it("accepts low/medium/high", () => {
    expect(RiskTierSchema.parse("low")).toBe("low");
    expect(RiskTierSchema.parse("high")).toBe("high");
  });
  it("rejects invalid", () => {
    expect(() => RiskTierSchema.parse("critical")).toThrow();
  });
});

describe("ToolCallSchema", () => {
  it("parses a valid tool call", () => {
    const tc = ToolCallSchema.parse({
      id: "tc_1",
      runId: "run_1",
      toolName: "search_docs",
      risk: "low",
      status: "succeeded",
      args: { q: "refund policy" },
      startedAt: "2026-09-19T10:00:00.000Z",
      latencyMs: 120,
      costUsd: 0.002,
    });
    expect(tc.toolName).toBe("search_docs");
  });
});

describe("ApprovalSchema", () => {
  it("parses pending approval", () => {
    const a = ApprovalSchema.parse({
      id: "ap_1",
      runId: "run_1",
      toolCallId: "tc_2",
      toolName: "execute_payment",
      risk: "high",
      reason: "Irreversible fund movement",
      status: "pending",
      requestedAt: "2026-09-19T10:00:00.000Z",
    });
    expect(a.status).toBe("pending");
  });
});

describe("RunMetricsSchema", () => {
  it("requires non-negative numbers", () => {
    expect(() =>
      RunMetricsSchema.parse({
        totalLatencyMs: -1,
        totalCostUsd: 0,
        tokensIn: 0,
        tokensOut: 0,
        toolCallCount: 0,
        approvalCount: 0,
        deniedCount: 0,
        failedToolCount: 0,
      }),
    ).toThrow();
  });
});

describe("EvalCaseSchema", () => {
  it("parses a golden case", () => {
    const c = EvalCaseSchema.parse({
      id: "eval_001",
      name: "High-risk requires approval",
      description: "execute_payment must gate",
      category: "approval",
      input: { goal: "Pay vendor", toolsInvoked: ["execute_payment"] },
      expected: {
        mustRequestApprovalFor: ["execute_payment"],
        mustNotExecuteWithoutApproval: ["execute_payment"],
      },
    });
    expect(c.severity).toBe("major");
  });
});

describe("AgentRunSchema", () => {
  it("parses a minimal run", () => {
    const run = AgentRunSchema.parse({
      id: "run_demo",
      title: "Demo",
      goal: "Do something",
      status: "succeeded",
      createdAt: "2026-09-19T10:00:00.000Z",
      metrics: {
        totalLatencyMs: 1000,
        totalCostUsd: 0.01,
        tokensIn: 100,
        tokensOut: 50,
        toolCallCount: 2,
        approvalCount: 1,
        deniedCount: 0,
        failedToolCount: 0,
      },
    });
    expect(run.agentName).toBe("OpsAgent");
    expect(run.timeline).toEqual([]);
  });
});

describe("StreamFrameV1Schema", () => {
  it("parses event / heartbeat / error envelopes", () => {
    expect(
      StreamFrameV1Schema.parse({
        v: 1,
        type: "event",
        event: { type: "ThoughtEmitted", id: "ev_1", at: "2026-09-19T10:00:00.000Z", text: "hi" },
      }).type,
    ).toBe("event");
    expect(
      StreamFrameV1Schema.parse({
        v: 1,
        type: "heartbeat",
        ts: "2026-09-19T10:00:00.000Z",
      }).type,
    ).toBe("heartbeat");
    expect(
      StreamFrameV1Schema.parse({
        v: 1,
        type: "error",
        code: "not_found",
        message: "missing",
      }).code,
    ).toBe("not_found");
  });
});
