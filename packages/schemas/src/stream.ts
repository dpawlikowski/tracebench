import { z } from "zod";
import { AgentRunSchema, TimelineEventSchema } from "./run";

/**
 * SSE stream envelope v1.
 * `event` payload is intentionally loose at the wire level so domain events
 * (packages/domain) and legacy timeline projections can share one frame shape.
 * Prefer parsing with DomainEvent on the domain side when applying reduce.
 */
export const StreamFrameV1Schema = z.discriminatedUnion("type", [
  z.object({
    v: z.literal(1),
    type: z.literal("event"),
    event: z.object({ type: z.string() }).passthrough(),
  }),
  z.object({
    v: z.literal(1),
    type: z.literal("snapshot"),
    run: AgentRunSchema,
  }),
  z.object({
    v: z.literal(1),
    type: z.literal("heartbeat"),
    ts: z.string().datetime(),
  }),
  z.object({
    v: z.literal(1),
    type: z.literal("error"),
    code: z.string(),
    message: z.string(),
  }),
]);
export type StreamFrameV1 = z.infer<typeof StreamFrameV1Schema>;

/** @deprecated v0 unversioned payloads — kept for reference / migration notes */
export const LegacyStreamPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("run.meta"), runId: z.string(), status: z.string() }),
  z.object({ type: z.literal("timeline.event"), event: TimelineEventSchema }),
  z.object({ type: z.literal("run.done"), runId: z.string(), status: z.string() }),
]);
