import type { ToolPolicyInput } from "@tracebench/schemas";
import type { JevRiskEvaluation } from "@tracebench/domain";
import type { EvalScoreState, JevEvalEvaluation } from "./eval-types";

/**
 * Port for TypeSafe Jev evaluations.
 * MockJevAdapter is the default (zero keys). LiveJevAdapter needs AI Gateway OIDC.
 *
 * Two surfaces share the same adapter:
 *   - evaluateToolRisk — HITL tool gate (ADR 0002)
 *   - evaluateGoldenCase — eval / release scorer (docs/jev.md)
 */
export interface JevAdapter {
  readonly kind: "mock" | "live";
  evaluateToolRisk(input: ToolPolicyInput): Promise<JevRiskEvaluation>;
  evaluateGoldenCase(state: EvalScoreState): Promise<JevEvalEvaluation>;
}

export type JevAdapterKind = "mock" | "live";
