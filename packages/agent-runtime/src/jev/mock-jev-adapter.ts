import type { RiskTier, ToolPolicyInput } from "@tracebench/schemas";
import type { JevRiskEvaluation } from "@tracebench/domain";
import type { JevAdapter } from "./ports";
import type { EvalScoreState, JevEvalEvaluation } from "./eval-types";
import { mockEvalEvaluation } from "./mock-eval-score";

/**
 * Deterministic Jev stand-in — DEFAULT for demos / CI (no API keys, no OIDC).
 * Maps catalog risk → calibrated answers + typesafe confidence metadata.
 * Also scores golden cases for the eval / release gate (mock-jev path).
 */
export class MockJevAdapter implements JevAdapter {
  readonly kind = "mock" as const;

  async evaluateToolRisk(input: ToolPolicyInput): Promise<JevRiskEvaluation> {
    const tier = effectiveTier(input);
    return answersForTier(tier);
  }

  async evaluateGoldenCase(state: EvalScoreState): Promise<JevEvalEvaluation> {
    return mockEvalEvaluation(state);
  }
}

function effectiveTier(input: ToolPolicyInput): RiskTier {
  if (input.irreversible) return "high";
  return input.catalogRisk;
}

function answersForTier(tier: RiskTier): JevRiskEvaluation {
  switch (tier) {
    case "low":
      return {
        source: "mock",
        confidence: { riskTier: 0.93, severity: 0.88 },
        answers: {
          riskTier: {
            type: "choice",
            choice: "low",
            probabilities: { low: 0.92, medium: 0.06, high: 0.02 },
          },
          safeToAutoAllow: { type: "boolean", probability: 0.95 },
          severity: {
            type: "score",
            score: 0.25,
            probabilities: { "0": 0.8, "1": 0.15, "2": 0.05, "3": 0 },
          },
        },
      };
    case "medium":
      return {
        source: "mock",
        confidence: { riskTier: 0.72, severity: 0.65 },
        answers: {
          riskTier: {
            type: "choice",
            choice: "medium",
            probabilities: { low: 0.18, medium: 0.7, high: 0.12 },
          },
          safeToAutoAllow: { type: "boolean", probability: 0.35 },
          severity: {
            type: "score",
            score: 1.45,
            probabilities: { "0": 0.1, "1": 0.45, "2": 0.35, "3": 0.1 },
          },
        },
      };
    case "high":
      return {
        source: "mock",
        confidence: { riskTier: 0.9, severity: 0.85 },
        answers: {
          riskTier: {
            type: "choice",
            choice: "high",
            probabilities: { low: 0.02, medium: 0.1, high: 0.88 },
          },
          safeToAutoAllow: { type: "boolean", probability: 0.04 },
          severity: {
            type: "score",
            score: 2.75,
            probabilities: { "0": 0, "1": 0.05, "2": 0.2, "3": 0.75 },
          },
        },
      };
  }
}
