import { z } from "zod";

/** Lightweight agent identity within a run / pipeline. */
export const AgentRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["planner", "researcher", "executor", "reviewer", "ops", "other"]),
  modelHint: z.string().optional(),
});
export type AgentRef = z.infer<typeof AgentRefSchema>;

export const AgentMessageChannelSchema = z.enum([
  "task",
  "result",
  "status",
  "handoff",
  "error",
]);
export type AgentMessageChannel = z.infer<typeof AgentMessageChannelSchema>;
