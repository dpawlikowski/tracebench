"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { GraphNodeData } from "@/lib/graph/build-run-graph";

type ObsNodeType = Node<GraphNodeData, "obs">;

function ObsNodeImpl({ data }: NodeProps<ObsNodeType>) {
  return (
    <div className="min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-tb-border-strong" />
      <div className="text-[10px] uppercase tracking-wider text-tb-text-dim">{data.kind}</div>
      <div className="font-semibold text-tb-text">{data.label}</div>
      {data.subtitle && (
        <div className="max-w-[160px] truncate text-[11px] text-tb-text-muted">{data.subtitle}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-tb-border-strong" />
    </div>
  );
}

export const ObsNode = memo(ObsNodeImpl);
