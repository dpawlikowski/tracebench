import { z } from "zod";

export const RiskTierSchema = z.enum(["low", "medium", "high"]);
export type RiskTier = z.infer<typeof RiskTierSchema>;

export const ToolDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  risk: RiskTierSchema,
  irreversible: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  category: z.enum(["read", "write", "communicate", "execute"]).default("read"),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export const ToolCallStatusSchema = z.enum([
  "pending",
  "streaming",
  "awaiting_approval",
  "approved",
  "denied",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);
export type ToolCallStatus = z.infer<typeof ToolCallStatusSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  runId: z.string(),
  toolName: z.string(),
  risk: RiskTierSchema,
  status: ToolCallStatusSchema,
  args: z.record(z.unknown()).default({}),
  result: z.unknown().optional(),
  error: z.string().optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  latencyMs: z.number().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  tokensIn: z.number().int().nonnegative().optional(),
  tokensOut: z.number().int().nonnegative().optional(),
  approvalId: z.string().optional(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;
