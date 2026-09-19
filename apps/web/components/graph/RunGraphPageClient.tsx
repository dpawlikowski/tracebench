"use client";

import dynamic from "next/dynamic";
import type { AgentRun } from "@tracebench/schemas";
import { useChildRuns } from "@/lib/hooks/use-child-runs";

const RunGraphView = dynamic(
  () => import("@/components/graph/RunGraphView").then((m) => m.RunGraphView),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-tb-text-muted">Loading graph…</div>
    ),
  },
);

export function RunGraphPageClient({ run }: { run: AgentRun }) {
  const { children } = useChildRuns(run);
  return <RunGraphView run={run} children={children} />;
}
