import type { AgentRun, TimelineEvent } from "@tracebench/schemas";

export type GraphMode = "aggregated" | "expanded";

export type GraphNodeData = {
  label: string;
  kind: "agent" | "event" | "run";
  eventId?: string;
  agentId?: string;
  runId?: string;
  subtitle?: string;
};

export type GraphEdgeData = {
  kind: "spawn" | "message" | "await" | "join" | "contains";
};

export type BuiltGraph = {
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: GraphNodeData;
    type?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data: GraphEdgeData;
  }>;
};

/**
 * Build observe graph STRICTLY from run linkage + timeline events.
 * Never invents edges that are not in events / childRunIds.
 */
export function buildRunGraph(
  run: AgentRun,
  children: AgentRun[],
  mode: GraphMode,
): BuiltGraph {
  const childById = new Map(children.map((c) => [c.id, c]));
  const nodes: BuiltGraph["nodes"] = [];
  const edges: BuiltGraph["edges"] = [];

  // Parent run node
  nodes.push({
    id: `run:${run.id}`,
    position: { x: 280, y: 0 },
    data: {
      label: run.agentName || "Parent",
      kind: "run",
      runId: run.id,
      subtitle: run.title,
    },
  });

  // Agent nodes from run.agents or inferred from spawn events
  const agents = [...(run.agents ?? [])];
  for (const e of run.timeline) {
    if (e.kind === "agent_spawn" && !agents.some((a) => a.id === e.agent.id)) {
      agents.push(e.agent);
    }
  }

  agents.forEach((a, i) => {
    nodes.push({
      id: `agent:${a.id}`,
      position: { x: 40 + i * 220, y: 120 },
      data: {
        label: a.name,
        kind: "agent",
        agentId: a.id,
        subtitle: a.role,
      },
    });
  });

  // Child run nodes
  (run.childRunIds ?? []).forEach((cid, i) => {
    const child = childById.get(cid);
    nodes.push({
      id: `run:${cid}`,
      position: { x: 80 + i * 280, y: 280 },
      data: {
        label: child?.agentName ?? cid,
        kind: "run",
        runId: cid,
        subtitle: child?.title ?? "child run",
      },
    });
  });

  const pushEdge = (
    id: string,
    source: string,
    target: string,
    kind: GraphEdgeData["kind"],
    label?: string,
  ) => {
    if (edges.some((e) => e.id === id)) return;
    if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) return;
    edges.push({ id, source, target, label, data: { kind } });
  };

  for (const e of run.timeline) {
    mapEventToEdges(e, run, pushEdge, mode, nodes);
  }

  if (mode === "expanded") {
    // Place event nodes along a row under agents
    let ex = 0;
    for (const e of run.timeline) {
      if (
        e.kind !== "agent_spawn" &&
        e.kind !== "agent_message" &&
        e.kind !== "agent_await" &&
        e.kind !== "agent_join"
      ) {
        continue;
      }
      const nid = `event:${e.id}`;
      if (!nodes.some((n) => n.id === nid)) {
        nodes.push({
          id: nid,
          position: { x: 40 + ex * 160, y: 420 },
          data: {
            label: e.kind.replace("agent_", ""),
            kind: "event",
            eventId: e.id,
            subtitle: summarizeEvent(e),
          },
        });
        ex += 1;
      }
      // Link event to parent run for navigation
      pushEdge(`contains-${e.id}`, `run:${run.id}`, nid, "contains");
    }
  }

  return { nodes, edges };
}

function summarizeEvent(e: TimelineEvent): string {
  switch (e.kind) {
    case "agent_spawn":
      return e.agent.name;
    case "agent_message":
      return `${e.fromAgentId}→${e.toAgentId}`;
    case "agent_await":
      return e.awaitedRunId;
    case "agent_join":
      return e.outcome;
    default:
      return e.kind;
  }
}

function mapEventToEdges(
  e: TimelineEvent,
  run: AgentRun,
  pushEdge: (
    id: string,
    source: string,
    target: string,
    kind: GraphEdgeData["kind"],
    label?: string,
  ) => void,
  _mode: GraphMode,
  _nodes: BuiltGraph["nodes"],
) {
  switch (e.kind) {
    case "agent_spawn":
      pushEdge(
        `spawn-${e.id}`,
        `run:${run.id}`,
        `run:${e.childRunId}`,
        "spawn",
        "spawn",
      );
      pushEdge(
        `spawn-agent-${e.id}`,
        `agent:${e.agent.id}`,
        `run:${e.childRunId}`,
        "spawn",
      );
      break;
    case "agent_message":
      pushEdge(
        `msg-${e.id}`,
        `agent:${e.fromAgentId}`,
        `agent:${e.toAgentId}`,
        "message",
        e.channel,
      );
      break;
    case "agent_await":
      pushEdge(
        `await-${e.id}`,
        `run:${run.id}`,
        `run:${e.awaitedRunId}`,
        "await",
        "await",
      );
      break;
    case "agent_join":
      pushEdge(
        `join-${e.id}`,
        `run:${e.childRunId}`,
        `run:${run.id}`,
        "join",
        e.outcome,
      );
      break;
    default:
      break;
  }
}
