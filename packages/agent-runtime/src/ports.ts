import type { AgentRun } from "@tracebench/schemas";
import type { DecideApprovalCommand } from "@tracebench/domain";

/**
 * Persistence port for run projections (and optionally event append).
 * Fixture adapter is in-memory; Cloudflare DO persists via SQLite.
 */
export interface RunRepository {
  list(): Promise<AgentRun[]>;
  get(id: string): Promise<AgentRun | undefined>;
}

export type DecideApprovalInput = Pick<
  DecideApprovalCommand,
  "runId" | "approvalId" | "decision" | "decidedBy" | "note"
>;

/**
 * HITL / live agent surface. Same contract for fixture demo and Cloudflare Agents.
 */
export interface AgentTransport {
  listRuns(): Promise<AgentRun[]>;
  getRun(id: string): Promise<AgentRun | undefined>;
  /**
   * Subscribe to SSE v1 frames (`text/event-stream` body).
   * Caller reads the stream; transport does not parse.
   */
  subscribe(
    runId: string,
    opts?: { speed?: number; signal?: AbortSignal },
  ): Promise<Response>;
  decideApproval(cmd: DecideApprovalInput): Promise<AgentRun | undefined>;
}

export type AgentTransportKind = "fixture" | "cloudflare";
