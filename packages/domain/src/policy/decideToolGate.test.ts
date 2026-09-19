import { describe, expect, it } from "vitest";
import {
  decideToolGate,
  TOOL_GATE_THRESHOLDS,
  type JevRiskEvaluation,
} from "./decideToolGate";

function clearLowEval(overrides?: Partial<JevRiskEvaluation>): JevRiskEvaluation {
  return {
    source: "mock",
    confidence: { riskTier: 0.92, severity: 0.8 },
    answers: {
      riskTier: {
        type: "choice",
        choice: "low",
        probabilities: { low: 0.91, medium: 0.07, high: 0.02 },
      },
      safeToAutoAllow: { type: "boolean", probability: 0.94 },
      severity: {
        type: "score",
        score: 0.3,
        probabilities: { "0": 0.8, "1": 0.15, "2": 0.05, "3": 0 },
      },
    },
    ...overrides,
  };
}

describe("decideToolGate", () => {
  it("auto-allows high-confidence low-risk evaluations", () => {
    const decision = decideToolGate({
      catalogRisk: "low",
      evaluation: clearLowEval(),
    });
    expect(decision.action).toBe("auto_allow");
  });

  it("escalates when confidence is below floor", () => {
    const decision = decideToolGate({
      catalogRisk: "low",
      evaluation: clearLowEval({
        confidence: { riskTier: TOOL_GATE_THRESHOLDS.minRiskConfidence - 0.01 },
      }),
    });
    expect(decision.action).toBe("escalate_hitl");
  });

  it("always escalates catalog high-risk even with clear low answers", () => {
    const decision = decideToolGate({
      catalogRisk: "high",
      evaluation: clearLowEval(),
    });
    expect(decision.action).toBe("escalate_hitl");
    expect(decision.reason).toMatch(/high-risk/i);
  });

  it("always escalates irreversible tools", () => {
    const decision = decideToolGate({
      catalogRisk: "low",
      irreversible: true,
      evaluation: clearLowEval(),
    });
    expect(decision.action).toBe("escalate_hitl");
  });

  it("denies on live error for high-risk (fail closed)", () => {
    const decision = decideToolGate({
      catalogRisk: "high",
      evaluation: clearLowEval({ source: "live", error: "OIDC missing" }),
    });
    expect(decision.action).toBe("deny");
  });

  it("escalates on live error for medium risk", () => {
    const decision = decideToolGate({
      catalogRisk: "medium",
      evaluation: clearLowEval({ source: "live", error: "timeout" }),
    });
    expect(decision.action).toBe("escalate_hitl");
  });

  it("auto-allows catalog-only low risk when evaluation is absent", () => {
    const decision = decideToolGate({ catalogRisk: "low" });
    expect(decision.action).toBe("auto_allow");
    expect(decision.source).toBe("catalog_only");
  });
});
