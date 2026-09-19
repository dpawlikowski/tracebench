import { z } from "zod";
import { RiskTierSchema } from "./tool";

export const ApprovalDecisionSchema = z.enum(["approved", "denied", "expired"]);
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const ApprovalSchema = z.object({
  id: z.string(),
  runId: z.string(),
  toolCallId: z.string(),
  toolName: z.string(),
  risk: RiskTierSchema,
  reason: z.string(),
  argsPreview: z.record(z.unknown()).default({}),
  status: z.enum(["pending", "approved", "denied", "expired"]),
  requestedAt: z.string().datetime(),
  decidedAt: z.string().datetime().optional(),
  decidedBy: z.string().optional(),
  note: z.string().optional(),
});
export type Approval = z.infer<typeof ApprovalSchema>;
