import {
  createAgentTransport,
  type AgentTransport,
} from "@tracebench/agent-runtime";

/**
 * Composition-root transport selection.
 * - fixture (default): in-memory + domain reduce — zero keys, e2e-safe
 * - cloudflare: HTTP to apps/agent-worker (Durable Object per run)
 */
export function getTransport(): AgentTransport {
  return createAgentTransport({
    kind: process.env.AGENT_TRANSPORT ?? "fixture",
    cloudflareUrl: process.env.CF_AGENT_URL,
  });
}
