import type { AgentRef, AgentRun } from "@tracebench/schemas";

/** Stable palette — text + soft bg; never color-only (always pair with label). */
const PALETTE = [
  { fg: "#B8FF3D", bg: "rgba(184, 255, 61, 0.12)" },
  { fg: "#4ADE80", bg: "rgba(74, 222, 128, 0.15)" },
  { fg: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" },
  { fg: "#A1A1AA", bg: "rgba(161, 161, 170, 0.15)" },
  { fg: "#FF5C5C", bg: "rgba(255, 92, 92, 0.15)" },
  { fg: "#E4E4E7", bg: "rgba(228, 228, 231, 0.12)" },
] as const;

export type AgentTone = (typeof PALETTE)[number];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function agentTone(agentId: string): AgentTone {
  return PALETTE[hashId(agentId) % PALETTE.length]!;
}

/** Resolve display name from run.agents, else raw id. */
export function agentDisplayName(run: AgentRun, agentId: string): string {
  const hit = run.agents?.find((a) => a.id === agentId);
  return hit?.name ?? agentId;
}

/**
 * Ordered multi-agent sequence for the strip above Logs.
 * Prefer `run.agents`; fall back to spawn events (+ primary if needed).
 */
export function sequenceAgents(run: AgentRun): AgentRef[] {
  if (run.agents && run.agents.length >= 2) return run.agents;

  const seen = new Map<string, AgentRef>();
  for (const e of run.timeline) {
    if (e.kind === "agent_spawn") {
      if (!seen.has(e.agent.id)) seen.set(e.agent.id, e.agent);
    }
  }
  if (seen.size >= 2) return [...seen.values()];

  // Single primary — no strip
  return run.agents ?? [];
}
