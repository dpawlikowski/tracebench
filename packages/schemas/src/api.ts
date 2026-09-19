import { z } from "zod";
import { AgentRunSchema, RunSummarySchema } from "./run";
import { EvalCaseSchema, EvalSuiteReportSchema } from "./eval";

/** POST /api/runs/:id/approve body */
export const ApprovalRequestSchema = z.object({
  approvalId: z.string().min(1),
  decision: z.enum(["approved", "denied"]),
  note: z.string().optional(),
});
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const RunsListResponseSchema = z.object({
  runs: z.array(RunSummarySchema),
});
export type RunsListResponse = z.infer<typeof RunsListResponseSchema>;

export const RunDetailResponseSchema = z.object({
  run: AgentRunSchema,
});
export type RunDetailResponse = z.infer<typeof RunDetailResponseSchema>;

export const ApproveResponseSchema = z.object({
  run: AgentRunSchema,
});
export type ApproveResponse = z.infer<typeof ApproveResponseSchema>;

export const EvalsResponseSchema = z.object({
  report: EvalSuiteReportSchema,
  cases: z.array(EvalCaseSchema),
});
export type EvalsResponse = z.infer<typeof EvalsResponseSchema>;

export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  detail: z.string().optional(),
  mode: z.string().optional(),
  count: z.number().optional(),
  optional: z.boolean().optional(),
});

export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  demoMode: z
    .object({
      active: z.boolean(),
      kind: z.enum(["demo", "hybrid", "live"]),
      transport: z.string(),
      jev: z.string(),
      evalScorer: z.string(),
    })
    .optional(),
  checks: z.object({
    web: HealthCheckSchema,
    fixtures: HealthCheckSchema,
    agentTransport: HealthCheckSchema,
    jev: HealthCheckSchema,
    evalGate: HealthCheckSchema.optional(),
    cloudflare: HealthCheckSchema.optional(),
  }),
  version: z.string().optional(),
  commit: z.string().optional(),
  ts: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
});
