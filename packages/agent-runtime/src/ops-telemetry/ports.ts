import type { OpsRunSpanSummary, OpsSpan, OpsTelemetryKind } from "./types";

/** Ops telemetry port — fixture today, OTLP/CF later (ADR 0004). */
export interface OpsTelemetry {
  readonly kind: OpsTelemetryKind;
  getSpansForRun(runId: string): Promise<OpsSpan[]>;
  listRunSummaries(): Promise<OpsRunSpanSummary[]>;
}
