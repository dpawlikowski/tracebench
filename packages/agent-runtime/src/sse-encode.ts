import type { DomainEvent } from "@tracebench/domain";
import { timelineEventToDomain } from "@tracebench/domain";
import type { AgentRun, StreamFrameV1 } from "@tracebench/schemas";

/** Encode one SSE `data:` frame. */
export function encodeSseFrame(frame: StreamFrameV1): string {
  return `data: ${JSON.stringify(frame)}\n\n`;
}

/**
 * Build a ReadableStream of SSE v1 frames that replays a run's fixture timeline
 * as domain events (same contract as `/api/runs/[id]/stream`).
 */
export function createTimelineReplayStream(
  run: AgentRun,
  opts?: { speed?: number },
): ReadableStream<Uint8Array> {
  const speed = opts?.speed && opts.speed > 0 ? opts.speed : 1;
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (frame: StreamFrameV1) => {
        controller.enqueue(encoder.encode(encodeSseFrame(frame)));
      };

      send({ v: 1, type: "snapshot", run });

      for (const step of run.replayPlan) {
        const timelineEvent = run.timeline.find((e) => e.id === step.eventId);
        if (!timelineEvent) continue;
        const domainEvent: DomainEvent | null = timelineEventToDomain(timelineEvent, run);
        if (!domainEvent) continue;
        const delay = Math.max(0, Math.round(step.delayMs / speed));
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }
        send({ v: 1, type: "event", event: domainEvent });
      }

      send({ v: 1, type: "heartbeat", ts: new Date().toISOString() });
      controller.close();
    },
  });
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
} as const;
