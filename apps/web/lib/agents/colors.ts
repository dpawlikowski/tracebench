import type { AgentRef, AgentRun } from "@tracebench/schemas";

/** Stable palette — text + soft bg; never color-only (always pair with label). */
const PALETTE = [
  { fg: "#5b9fd4", bg: "rgba(91, 159, 212, 0.18)" },
  { fg: "#3dba7e", bg: "rgba(61, 186, 126, 0.18)" },
  { fg: "#d4a017", bg: "rgba(212, 160, 23, 0.18)" },
  { fg: "#7c9cff", bg: "rgba(124, 156, 255, 0.18)" },
  { fg: "#e05d5d", bg: "rgba(224, 93, 93, 0.18)" },
  { fg: "#c084fc", bg: "rgba(192, 132, 252, 0.18)" },
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
