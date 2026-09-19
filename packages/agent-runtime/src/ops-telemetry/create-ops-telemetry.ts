import type { OpsTelemetry } from "./ports";
import type { OpsTelemetryKind } from "./types";
import { getFixtureOpsTelemetry } from "./fixture-ops-telemetry";

export type CreateOpsTelemetryConfig = {
  kind?: OpsTelemetryKind | string;
};

/** Factory — OPS_TELEMETRY=fixture default. */
export function createOpsTelemetry(config: CreateOpsTelemetryConfig = {}): OpsTelemetry {
  const kind = (
    config.kind ??
    (typeof process !== "undefined" ? process.env.OPS_TELEMETRY : undefined) ??
    "fixture"
  ).toLowerCase();
  if (kind === "otlp" || kind === "cloudflare") {
    return getFixtureOpsTelemetry();
  }
  return getFixtureOpsTelemetry();
}

let singleton: OpsTelemetry | undefined;

export function getOpsTelemetry(): OpsTelemetry {
  if (!singleton) singleton = createOpsTelemetry();
  return singleton;
}

export function resetOpsTelemetry(): void {
  singleton = undefined;
}
