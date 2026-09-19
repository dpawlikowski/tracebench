import { routeAgentRequest } from "agents";
import { listRunSummaries, getRunById } from "@tracebench/fixtures";
import { RunAgent } from "./run-agent";

export { RunAgent };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/**
 * Tracebench agent worker (Cloudflare Agents / Durable Objects).
 *
 * REST (mirrors Next BFF):
 * - GET  /api/runs
 * - GET  /api/runs/:id
 * - GET  /api/runs/:id/stream
 * - POST /api/runs/:id/approve
 * - GET  /api/runs/:id/events
 *
 * Also: /agents/run-agent/:runId/* via routeAgentRequest
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return withCors(Response.json({ ok: true, service: "tracebench-agent-worker" }));
    }

    if (url.pathname === "/api/runs" && request.method === "GET") {
      return withCors(Response.json({ runs: listRunSummaries() }));
    }

    const match = url.pathname.match(/^\/api\/runs\/([^/]+)(\/.*)?$/);
    if (match) {
      const runId = decodeURIComponent(match[1]!);
      const rest = match[2] ?? "";

      if (!getRunById(runId)) {
        return withCors(
          new Response(
            JSON.stringify({ v: 1, type: "error", code: "not_found", message: "Run not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          ),
        );
      }

      let agentPath = "/";
      if (rest === "/stream") agentPath = "/stream";
      else if (rest === "/approve") agentPath = "/approve";
      else if (rest === "/events") agentPath = "/events";
      else if (rest === "" || rest === "/") agentPath = "/";
      else {
        return withCors(new Response("Not found", { status: 404 }));
      }

      const agentUrl = new URL(agentPath, "https://run-agent.internal");
      agentUrl.searchParams.set("runId", runId);
      if (rest === "/stream") {
        agentUrl.searchParams.set("speed", url.searchParams.get("speed") ?? "1");
      }

      const agentReq = new Request(agentUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
      });

      const doId = env.RunAgent.idFromName(runId);
      const doStub = env.RunAgent.get(doId);
      const res = await doStub.fetch(agentReq);
      return withCors(res);
    }

    const routed = await routeAgentRequest(request, env);
    if (routed) return withCors(routed);

    return withCors(new Response("Not found", { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
