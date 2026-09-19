"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { AgentRun } from "@tracebench/schemas";
import { Badge, Button, Panel } from "@tracebench/ui";
import {
  buildRunGraph,
  type GraphMode,
  type GraphNodeData,
} from "@/lib/graph/build-run-graph";
import { HelpTip } from "@/components/help/HelpTip";
import { ObsNode } from "@/components/graph/ObsNode";

const nodeTypes = { obs: ObsNode };

/** Presentational observe graph — parent supplies already-fetched children. */
export function RunGraphView({
  run,
  children,
}: {
  run: AgentRun;
  children: AgentRun[];
}) {
  const [mode, setMode] = useState<GraphMode>("aggregated");
  const router = useRouter();

  const built = useMemo(() => buildRunGraph(run, children, mode), [run, children, mode]);

  // Fully controlled graph — no useNodesState/useEffect sync (avoids max-update-depth).
  const nodes: Node<GraphNodeData>[] = useMemo(
    () =>
      built.nodes.map((n) => ({
        id: n.id,
        position: n.position,
        type: "obs",
        data: n.data,
        draggable: false,
        connectable: false,
        style: nodeStyle(n.data.kind),
      })),
    [built],
  );

  const edges: Edge[] = useMemo(
    () =>
      built.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: edgeStroke(e.data.kind) },
        labelStyle: { fill: "#8b9bb4", fontSize: 10 },
        animated: e.data.kind === "message",
      })),
    [built],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node<GraphNodeData>) => {
      const d = node.data;
      if (d.eventId) {
        router.push(`/runs/${run.id}?hl=${d.eventId}#tl-${d.eventId}`);
        return;
      }
      if (d.runId && d.runId !== run.id) {
        router.push(`/runs/${d.runId}`);
        return;
      }
      if (d.runId === run.id) {
        router.push(`/runs/${run.id}`);
      }
    },
    [router, run.id],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-[22px] tracking-tight">Agent graph</h1>
          <p className="mt-1.5 max-w-[640px] text-tb-text-muted">
            Read-only observe graph for <code className="font-mono text-[12px]">{run.id}</code> —
            edges come only from spawn / message / await / join events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpTip
            title="Observe graph"
            body="Aggregated shows agents and child runs. Expanded adds event nodes. Click a node to open the run or jump to the timeline event."
            href="/help/anatomy-of-a-run"
          />
          <Button
            size="sm"
            variant={mode === "aggregated" ? "primary" : "ghost"}
            onClick={() => setMode("aggregated")}
            data-testid="graph-mode-aggregated"
          >
            Aggregated
          </Button>
          <Button
            size="sm"
            variant={mode === "expanded" ? "primary" : "ghost"}
            onClick={() => setMode("expanded")}
            data-testid="graph-mode-expanded"
          >
            Expanded
          </Button>
          <Button size="sm" variant="secondary" onClick={() => router.push(`/runs/${run.id}`)}>
            ← Run detail
          </Button>
        </div>
      </div>

      <Panel
        title={run.title}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{mode}</Badge>
            <Badge tone="neutral">{nodes.length}n</Badge>
            <Badge tone="neutral">{edges.length}e</Badge>
          </div>
        }
      >
        <div
          className="h-[520px] overflow-hidden rounded-sm border border-tb-border bg-tb-bg"
          data-testid="run-graph"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
            minZoom={0.4}
            maxZoom={1.5}
          >
            <Background color="#243044" gap={20} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(n) => {
                const k = (n.data as GraphNodeData)?.kind;
                if (k === "agent") return "#5b9fd4";
                if (k === "event") return "#3dba7e";
                return "#8b9bb4";
              }}
              maskColor="rgba(11,15,20,0.7)"
            />
          </ReactFlow>
        </div>
      </Panel>
    </div>
  );
}

function nodeStyle(kind: GraphNodeData["kind"]): React.CSSProperties {
  const base: React.CSSProperties = {
    background: "#121821",
    color: "#e8eef7",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    minWidth: 140,
  };
  if (kind === "agent") return { ...base, borderColor: "#5b9fd4" };
  if (kind === "event") return { ...base, borderColor: "#3dba7e", minWidth: 100 };
  return base;
}

function edgeStroke(kind: string): string {
  if (kind === "message") return "#3dba7e";
  if (kind === "await") return "#d4a017";
  if (kind === "join") return "#5b9fd4";
  if (kind === "spawn") return "#7c9cff";
  return "#5c6b82";
}
