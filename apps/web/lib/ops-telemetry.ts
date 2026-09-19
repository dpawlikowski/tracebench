import {
  createOpsTelemetry,
  type OpsTelemetry,
} from "@tracebench/agent-runtime";

/**
 * Composition-root OpsTelemetry selection.
 * - fixture (default): project spans from seeded runs — zero keys
 * - otlp / cloudflare: reserved; currently fall back to fixture
 */
export function getOpsTelemetryPort(): OpsTelemetry {
  return createOpsTelemetry({
    kind: process.env.OPS_TELEMETRY ?? "fixture",
  });
}
