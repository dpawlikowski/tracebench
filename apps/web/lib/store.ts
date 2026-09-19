import type { AgentRun, Approval } from "@tracebench/schemas";
import { resetFixtureTransport } from "@tracebench/agent-runtime";
import { getTransport } from "./transport";

/**
 * Thin façade over AgentTransport.
 * Business rules live in @tracebench/domain; this only selects fixture vs Cloudflare.
 */

export function resetStore() {
  resetFixtureTransport();
}

export async function listRuns(): Promise<AgentRun[]> {
  return getTransport().listRuns();
}

export async function getRun(id: string): Promise<AgentRun | undefined> {
  return getTransport().getRun(id);
}

export async function decideApproval(
  runId: string,
  approvalId: string,
  decision: "approved" | "denied",
  decidedBy = "dominik.pawlikowski",
  note?: string,
): Promise<AgentRun | undefined> {
  return getTransport().decideApproval({
    runId,
    approvalId,
    decision,
    decidedBy,
    ...(note !== undefined ? { note } : {}),
  });
}

export async function subscribeRun(
  runId: string,
  opts?: { speed?: number; signal?: AbortSignal },
): Promise<Response> {
  return getTransport().subscribe(runId, opts);
}

export type { Approval };
