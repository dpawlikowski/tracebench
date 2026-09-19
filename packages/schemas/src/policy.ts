import { z } from "zod";
import { RiskTierSchema } from "./tool";

/** Outcome of the risk gate before a tool may run. */
export const ToolGateActionSchema = z.enum(["auto_allow", "escalate_hitl", "deny"]);
export type ToolGateAction = z.infer<typeof ToolGateActionSchema>;

export const ToolGateDecisionSchema = z.object({
  action: ToolGateActionSchema,
  reason: z.string(),
  /** Catalog risk declared on the tool definition. */
  catalogRisk: RiskTierSchema,
  /** Jev choice for operational risk (when available). */
  evaluatedRisk: RiskTierSchema.optional(),
  /** Confidence for the riskTier choice from providerMetadata.typesafe.confidence. */
  riskConfidence: z.number().min(0).max(1).optional(),
  /** Selected option probability for riskTier. */
  riskProbability: z.number().min(0).max(1).optional(),
  /** P(true) that the call is safe to auto-allow. */
  safeProbability: z.number().min(0).max(1).optional(),
  /** Severity score (0..n-1 weighted mean). */
  severityScore: z.number().optional(),
  /** Evaluation source used for this decision. */
  source: z.enum(["mock", "live", "catalog_only"]).default("mock"),
});
export type ToolGateDecision = z.infer<typeof ToolGateDecisionSchema>;

export const ToolPolicyInputSchema = z.object({
  toolName: z.string().min(1),
  catalogRisk: RiskTierSchema,
  irreversible: z.boolean().default(false),
  args: z.record(z.unknown()).default({}),
  runGoal: z.string().optional(),
  agentThought: z.string().optional(),
});
export type ToolPolicyInput = z.infer<typeof ToolPolicyInputSchema>;
