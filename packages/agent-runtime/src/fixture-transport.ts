import type { AgentRun } from "@tracebench/schemas";
import { SEEDED_RUNS, getRunById as fixtureGet } from "@tracebench/fixtures";
import { decideApproval as domainDecideApproval, fold } from "@tracebench/domain";
import type { AgentTransport, DecideApprovalInput, RunRepository } from "./ports";
import { SSE_HEADERS, createTimelineReplayStream } from "./sse-encode";

function cloneRuns(): AgentRun[] {
  return structuredClone(SEEDED_RUNS);
}

/**
 * In-memory fixture adapter — default for `pnpm dev` (zero API keys).
 * Mutations go through domain commands → events → reduce.
 */
export class FixtureAgentTransport implements AgentTransport, RunRepository {
  private runs: AgentRun[];

  constructor(seed?: AgentRun[]) {
    this.runs = seed ? structuredClone(seed) : cloneRuns();
  }

  reset(): void {
    this.runs = cloneRuns();
  }

  async list(): Promise<AgentRun[]> {
    return this.runs;
  }

  async get(id: string): Promise<AgentRun | undefined> {
    return this.runs.find((r) => r.id === id) ?? fixtureGet(id);
  }

  async listRuns(): Promise<AgentRun[]> {
    return this.list();
  }

  async getRun(id: string): Promise<AgentRun | undefined> {
    return this.get(id);
  }

  async subscribe(
    runId: string,
    opts?: { speed?: number; signal?: AbortSignal },
  ): Promise<Response> {
    const run = await this.get(runId);
    if (!run) {
      return new Response(
        JSON.stringify({
          v: 1,
          type: "error",
          code: "not_found",
          message: "Run not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const stream = createTimelineReplayStream(run, { speed: opts?.speed });
    // Best-effort abort: close is handled by consumer canceling the reader.
    opts?.signal?.addEventListener("abort", () => {
      /* consumer cancels ReadableStream reader */
    });
    return new Response(stream, { headers: { ...SSE_HEADERS } });
  }

  async decideApproval(cmd: DecideApprovalInput): Promise<AgentRun | undefined> {
    const idx = this.runs.findIndex((r) => r.id === cmd.runId);
    if (idx < 0) return undefined;

    const current = this.runs[idx]!;
    const result = domainDecideApproval(current, {
      runId: cmd.runId,
      approvalId: cmd.approvalId,
      decision: cmd.decision,
      decidedBy: cmd.decidedBy,
      ...(cmd.note !== undefined ? { note: cmd.note } : {}),
    });

    if (!result.ok) return current;

    const next = fold(current, result.events);
    this.runs[idx] = next;
    return next;
  }
}

/** Process-wide singleton used by the Next BFF when AGENT_TRANSPORT=fixture. */
let singleton: FixtureAgentTransport | undefined;

export function getFixtureTransport(): FixtureAgentTransport {
  if (!singleton) singleton = new FixtureAgentTransport();
  return singleton;
}

export function resetFixtureTransport(): void {
  getFixtureTransport().reset();
}
