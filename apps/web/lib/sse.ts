import type { DomainEvent } from "@tracebench/domain";
import { domainEventTimelineId } from "@tracebench/domain";
import type { StreamFrameV1 } from "@tracebench/schemas";
import { StreamFrameV1Schema } from "@tracebench/schemas";

export type ParsedSseFrame =
  | { kind: "frame"; frame: StreamFrameV1 }
  | { kind: "invalid"; raw: unknown };

/**
 * Parse one SSE `data:` JSON payload into a v1 StreamFrame.
 * Accepts strict v1 envelopes only (Phase A — no legacy fallback on the wire).
 */
export function parseStreamFrame(raw: unknown): ParsedSseFrame {
  const parsed = StreamFrameV1Schema.safeParse(raw);
  if (!parsed.success) {
    return { kind: "invalid", raw };
  }
  return { kind: "frame", frame: parsed.data };
}

/** Timeline row id to reveal for an event frame, if any. */
export function timelineIdFromFrame(frame: StreamFrameV1): string | undefined {
  if (frame.type !== "event") return undefined;
  return domainEventTimelineId(frame.event as DomainEvent);
}

/**
 * Incremental SSE buffer parser: feed chunks, get completed `data:` JSON values.
 */
export function createSseJsonParser() {
  let buffer = "";
  return {
    push(chunk: string): unknown[] {
      buffer += chunk;
      const frames: unknown[] = [];
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        try {
          frames.push(JSON.parse(line.slice(6)));
        } catch {
          // ignore malformed JSON chunk
        }
      }
      return frames;
    },
    reset() {
      buffer = "";
    },
  };
}
