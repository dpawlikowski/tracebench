import { decideToolGate } from "@tracebench/domain";
import type { ToolGateDecision, ToolPolicyInput } from "@tracebench/schemas";
import type { JevAdapter } from "./ports";
import { getJevAdapter } from "./create-jev-adapter";

export type EvaluateToolPolicyResult = {
  decision: ToolGateDecision;
  evaluationSource: JevAdapter["kind"];
};

/**
 * Evaluate a proposed tool call with Jev (mock by default) and apply the risk gate.
 * Policy: high confidence + low risk → auto_allow; else escalate HITL.
 * Live errors fail closed for high-risk / irreversible tools.
 */
export async function evaluateToolPolicy(
  input: ToolPolicyInput,
  adapter: JevAdapter = getJevAdapter(),
): Promise<EvaluateToolPolicyResult> {
  const evaluation = await adapter.evaluateToolRisk(input);
  const decision = decideToolGate({
    catalogRisk: input.catalogRisk,
    irreversible: input.irreversible,
    evaluation,
  });
  return { decision, evaluationSource: adapter.kind };
}
