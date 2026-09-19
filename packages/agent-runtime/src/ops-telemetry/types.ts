/**
 * OTel GenAI–shaped span types for Tracebench OpsTelemetry (ADR 0004).
 * Span names: invoke_agent · chat · execute_tool · tool_approval
 */

export type OpsSpanName =
  | "invoke_agent"
  | "chat"
  | "execute_tool"
  | "tool_approval";

export type OpsSpanStatus = "ok" | "error" | "unset";

export type OpsSpanAttributes = {
  "gen_ai.operation.name"?: OpsSpanName;
  "gen_ai.request.model"?: string;
  "gen_ai.usage.input_tokens"?: number;
  "gen_ai.usage.output_tokens"?: number;
  "gen_ai.usage.cost_usd"?: number;
  tool_name?: string;
  risk?: string;
  approval_id?: string;
  decision?: string;
  agent_name?: string;
  run_id?: string;
  summary?: string;
  [key: string]: string | number | boolean | undefined;
};

export type OpsSpan = {
  id: string;
  name: OpsSpanName;
  runId: string;
  parentSpanId?: string;
  startTime: string;
  endTime?: string;
  status: OpsSpanStatus;
  attributes?: OpsSpanAttributes;
};

export type OpsRunSpanSummary = {
  runId: string;
  title: string;
  status: string;
  spanCount: number;
  byName: Record<OpsSpanName, number>;
};

export type OpsTelemetryKind = "fixture" | "otlp" | "cloudflare";
