import { z } from "zod";
import { ToolCallSchema } from "./tool";
import { ApprovalSchema } from "./approval";
import { AuditEventSchema } from "./audit";
import { RunMetricsSchema } from "./metrics";
import { AgentRefSchema, AgentMessageChannelSchema } from "./agent";

export const RunStatusSchema = z.enum([
  "queued",
  "running",
  "awaiting_approval",
  "succeeded",
  "failed",
  "cancelled",
  "denied",
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const TimelineEventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("thought"),
    id: z.string(),
    at: z.string().datetime(),
    text: z.string(),
    agentId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("tool"),
    id: z.string(),
    at: z.string().datetime(),
    toolCallId: z.string(),
    agentId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("approval"),
    id: z.string(),
    at: z.string().datetime(),
    approvalId: z.string(),
    agentId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("outcome"),
    id: z.string(),
    at: z.string().datetime(),
    status: RunStatusSchema,
    summary: z.string(),
    agentId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("agent_spawn"),
    id: z.string(),
    at: z.string().datetime(),
    childRunId: z.string(),
    agent: AgentRefSchema,
  }),
  z.object({
    kind: z.literal("agent_message"),
    id: z.string(),
    at: z.string().datetime(),
    fromAgentId: z.string(),
    toAgentId: z.string(),
    channel: AgentMessageChannelSchema,
    payloadSummary: z.string(),
    level: z.enum(["debug", "info", "warn", "error"]).default("info"),
  }),
  z.object({
    kind: z.literal("agent_await"),
    id: z.string(),
    at: z.string().datetime(),
    awaitedRunId: z.string(),
    waiterAgentId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("agent_join"),
    id: z.string(),
    at: z.string().datetime(),
    childRunId: z.string(),
    outcome: z.enum(["succeeded", "failed", "denied", "cancelled"]),
    summary: z.string().optional(),
  }),
]);
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const AgentRunSchema = z.object({
  id: z.string(),
  title: z.string(),
  goal: z.string(),
  agentName: z.string().default("OpsAgent"),
  status: RunStatusSchema,
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  toolCalls: z.array(ToolCallSchema).default([]),
  approvals: z.array(ApprovalSchema).default([]),
  auditLog: z.array(AuditEventSchema).default([]),
  timeline: z.array(TimelineEventSchema).default([]),
  metrics: RunMetricsSchema,
  error: z.string().optional(),
  /** Nested multi-agent: parent linkage */
  parentRunId: z.string().optional(),
  childRunIds: z.array(z.string()).optional(),
  agents: z.array(AgentRefSchema).optional(),
  /** Replay stream chunks for demo (ms delay + event payload) */
  replayPlan: z
    .array(
      z.object({
        delayMs: z.number().int().nonnegative(),
        eventId: z.string(),
      }),
    )
    .default([]),
});
export type AgentRun = z.infer<typeof AgentRunSchema>;

export const RunSummarySchema = AgentRunSchema.pick({
  id: true,
  title: true,
  goal: true,
  agentName: true,
  status: true,
  createdAt: true,
  startedAt: true,
  endedAt: true,
  tags: true,
  metrics: true,
  error: true,
  parentRunId: true,
  childRunIds: true,
});
export type RunSummary = z.infer<typeof RunSummarySchema>;
