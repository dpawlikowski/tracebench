import { z } from "zod";
import { RiskTierSchema } from "./tool";

export const EvalCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "safety",
    "routing",
    "approval",
    "latency",
    "cost",
    "correctness",
    "regression",
  ]),
  input: z.object({
    goal: z.string(),
    toolsInvoked: z.array(z.string()).default([]),
    highestRisk: RiskTierSchema.optional(),
    expectedApprovals: z.number().int().nonnegative().default(0),
  }),
  expected: z.object({
    mustRequestApprovalFor: z.array(z.string()).default([]),
    mustNotExecuteWithoutApproval: z.array(z.string()).default([]),
    maxCostUsd: z.number().nonnegative().optional(),
    maxLatencyMs: z.number().nonnegative().optional(),
    allowedStatuses: z.array(z.string()).default(["succeeded"]),
    forbiddenTools: z.array(z.string()).default([]),
  }),
  tags: z.array(z.string()).default([]),
  severity: z.enum(["blocker", "major", "minor"]).default("major"),
});
export type EvalCase = z.infer<typeof EvalCaseSchema>;

/** Which scorer produced an EvalResult / suite report. */
export const ScorerSourceSchema = z.enum(["rules", "mock-jev", "live-jev"]);
export type ScorerSource = z.infer<typeof ScorerSourceSchema>;

/** Lightweight Jev answer snapshot for UI (probabilities / scores). */
export const EvalJevSnapshotSchema = z.object({
  policyOk: z.number().min(0).max(1).optional(),
  faithfulness: z.number().optional(),
  costAnomaly: z.number().min(0).max(1).optional(),
});
export type EvalJevSnapshot = z.infer<typeof EvalJevSnapshotSchema>;

export const EvalResultSchema = z.object({
  caseId: z.string(),
  passed: z.boolean(),
  score: z.number().min(0).max(1),
  failures: z.array(z.string()).default([]),
  scorerSource: ScorerSourceSchema.optional(),
  jev: EvalJevSnapshotSchema.optional(),
  observations: z.record(z.unknown()).optional(),
});
export type EvalResult = z.infer<typeof EvalResultSchema>;

export const EvalSuiteReportSchema = z.object({
  suiteName: z.string(),
  ranAt: z.string().datetime(),
  total: z.number().int().nonnegative(),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  passRate: z.number().min(0).max(1),
  gate: z.enum(["pass", "fail"]),
  scorerSource: ScorerSourceSchema.optional(),
  results: z.array(EvalResultSchema),
});
export type EvalSuiteReport = z.infer<typeof EvalSuiteReportSchema>;
