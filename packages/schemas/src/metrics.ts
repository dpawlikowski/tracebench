import { z } from "zod";

export const RunMetricsSchema = z.object({
  totalLatencyMs: z.number().nonnegative(),
  totalCostUsd: z.number().nonnegative(),
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  toolCallCount: z.number().int().nonnegative(),
  approvalCount: z.number().int().nonnegative(),
  deniedCount: z.number().int().nonnegative(),
  failedToolCount: z.number().int().nonnegative(),
  p50ToolLatencyMs: z.number().nonnegative().optional(),
  p95ToolLatencyMs: z.number().nonnegative().optional(),
});
export type RunMetrics = z.infer<typeof RunMetricsSchema>;
