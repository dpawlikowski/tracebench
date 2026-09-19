import type { AgentRun } from "@tracebench/schemas";
import type { AgentTransport, DecideApprovalInput } from "./ports";

/**
 * HTTP client for `apps/agent-worker` (Cloudflare Agents / Durable Objects).
 * Expects the worker to expose the same REST shape as the Next BFF.
 */
export class CloudflareAgentTransport implements AgentTransport {
  constructor(private readonly baseUrl: string) {
    if (!baseUrl) {
      throw new Error("CF_AGENT_URL is required when AGENT_TRANSPORT=cloudflare");
    }
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  async listRuns(): Promise<AgentRun[]> {
    const res = await fetch(this.url("/api/runs"));
    if (!res.ok) throw new Error(`CF listRuns failed: ${res.status}`);
    const data = (await res.json()) as { runs: AgentRun[] };
    return data.runs;
  }

  async getRun(id: string): Promise<AgentRun | undefined> {
    const res = await fetch(this.url(`/api/runs/${encodeURIComponent(id)}`));
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`CF getRun failed: ${res.status}`);
    const data = (await res.json()) as { run: AgentRun };
    return data.run;
  }

  async subscribe(
    runId: string,
    opts?: { speed?: number; signal?: AbortSignal },
  ): Promise<Response> {
    const speed = opts?.speed ?? 1;
    const res = await fetch(
      this.url(`/api/runs/${encodeURIComponent(runId)}/stream?speed=${speed}`),
      { signal: opts?.signal },
    );
    return res;
  }

  async decideApproval(cmd: DecideApprovalInput): Promise<AgentRun | undefined> {
    const res = await fetch(this.url(`/api/runs/${encodeURIComponent(cmd.runId)}/approve`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvalId: cmd.approvalId,
        decision: cmd.decision,
        decidedBy: cmd.decidedBy,
        note: cmd.note,
      }),
    });
    if (res.status === 404) return undefined;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`CF decideApproval failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as { run: AgentRun };
    return data.run;
  }
}
