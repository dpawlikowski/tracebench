import { Agent } from "agents";
import { decideApproval, fold, type DomainEvent } from "@tracebench/domain";
import { getRunById } from "@tracebench/fixtures";
import type { AgentRun, StreamFrameV1 } from "@tracebench/schemas";
import { SSE_HEADERS, createTimelineReplayStream } from "@tracebench/agent-runtime";

export type RunAgentState = {
  runId: string;
  run: AgentRun | null;
  initialized: boolean;
};

/**
 * One Durable Object / Agent instance per runId.
 * Domain events persisted in SQLite; projection in Agent state.
 */
export class RunAgent extends Agent<Env, RunAgentState> {
  override initialState: RunAgentState = {
    runId: "",
    run: null,
    initialized: false,
  };

  override async onStart() {
    this.sql`
      CREATE TABLE IF NOT EXISTS domain_events (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        at TEXT NOT NULL
      )
    `;
  }

  private resolveRunId(request: Request): string {
    const url = new URL(request.url);
    const fromQuery = url.searchParams.get("runId");
    if (fromQuery) return fromQuery;
    // Agents SDK sets instance name when routed via /agents/...
    const named = (this as unknown as { name?: string }).name;
    if (named) return named;
    return this.state.runId;
  }

  private ensureRun(runId: string): AgentRun | null {
    if (this.state.initialized && this.state.run && this.state.runId === runId) {
      return this.state.run;
    }

    const seed = getRunById(runId);
    if (!seed) {
      this.setState({ runId, run: null, initialized: true });
      return null;
    }

    let run = structuredClone(seed) as AgentRun;
    const rows = this.sql<{ payload: string }>`
      SELECT payload FROM domain_events ORDER BY seq ASC
    `;
    if (rows.length > 0) {
      const events = rows.map((r) => JSON.parse(r.payload) as DomainEvent);
      run = fold(run, events);
    }

    this.setState({ runId, run, initialized: true });
    return run;
  }

  private appendEvents(events: DomainEvent[]): AgentRun {
    const runId = this.state.runId;
    let run = this.state.run;
    if (!run) throw new Error("Run not initialized");

    for (const event of events) {
      const at = "at" in event ? String(event.at) : new Date().toISOString();
      this.sql`
        INSERT INTO domain_events (type, payload, at)
        VALUES (${event.type}, ${JSON.stringify(event)}, ${at})
      `;
    }
    run = fold(run, events);
    this.setState({ runId, run, initialized: true });
    return run;
  }

  override async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const runId = this.resolveRunId(request);
    const path = url.pathname;

    if (request.method === "GET" && (path === "/" || path.endsWith("/snapshot"))) {
      const run = this.ensureRun(runId);
      if (!run) return jsonError(404, "not_found", "Run not found");
      return Response.json({ run });
    }

    if (request.method === "GET" && path.endsWith("/stream")) {
      const run = this.ensureRun(runId);
      if (!run) return jsonError(404, "not_found", "Run not found");
      const speed = Number(url.searchParams.get("speed") ?? "1") || 1;
      const stream = createTimelineReplayStream(run, { speed });
      return new Response(stream, { headers: { ...SSE_HEADERS } });
    }

    if (request.method === "POST" && path.endsWith("/approve")) {
      const run = this.ensureRun(runId);
      if (!run) return jsonError(404, "not_found", "Run not found");

      let body: {
        approvalId?: string;
        decision?: "approved" | "denied";
        decidedBy?: string;
        note?: string;
      };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return jsonError(400, "invalid_body", "Invalid JSON body");
      }

      if (!body.approvalId || (body.decision !== "approved" && body.decision !== "denied")) {
        return jsonError(400, "invalid_body", "approvalId and decision required");
      }

      const result = decideApproval(run, {
        runId: run.id,
        approvalId: body.approvalId,
        decision: body.decision,
        decidedBy: body.decidedBy ?? "dominik.pawlikowski",
        ...(body.note !== undefined ? { note: body.note } : {}),
      });

      if (!result.ok) {
        return Response.json({ run, error: result.error }, { status: 400 });
      }

      const next = this.appendEvents(result.events);
      return Response.json({ run: next });
    }

    if (request.method === "GET" && path.endsWith("/events")) {
      this.ensureRun(runId);
      const rows = this.sql<{ seq: number; type: string; payload: string; at: string }>`
        SELECT seq, type, payload, at FROM domain_events ORDER BY seq ASC
      `;
      return Response.json({
        events: rows.map((r) => ({
          seq: r.seq,
          type: r.type,
          at: r.at,
          event: JSON.parse(r.payload) as DomainEvent,
        })),
      });
    }

    return jsonError(404, "not_found", `No handler for ${request.method} ${path}`);
  }
}

function jsonError(status: number, code: string, message: string): Response {
  const frame: StreamFrameV1 = { v: 1, type: "error", code, message };
  return new Response(JSON.stringify(frame), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
