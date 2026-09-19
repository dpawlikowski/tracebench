import { z } from "zod";

export const AuditEventTypeSchema = z.enum([
  "run.started",
  "run.completed",
  "run.failed",
  "run.cancelled",
  "tool.started",
  "tool.completed",
  "tool.failed",
  "approval.requested",
  "approval.approved",
  "approval.denied",
  "metric.recorded",
  "eval.flagged",
  "agent.spawned",
  "agent.message",
  "agent.await",
  "agent.joined",
]);
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  type: AuditEventTypeSchema,
  timestamp: z.string().datetime(),
  actor: z.enum(["agent", "human", "system"]).default("system"),
  message: z.string(),
  meta: z.record(z.unknown()).optional(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;
