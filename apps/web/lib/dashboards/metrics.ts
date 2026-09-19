import type { AgentRun, EvalSuiteReport, RunSummary } from "@tracebench/schemas";

export function fleetMetrics(runs: RunSummary[], evalReport?: EvalSuiteReport | null) {
  const totalCost = runs.reduce((s, r) => s + r.metrics.totalCostUsd, 0);
  const p95s = runs.map((r) => r.metrics.p95ToolLatencyMs ?? 0).filter((n) => n > 0);
  const p95 = p95s.length ? Math.max(...p95s) : 0;
  const tokensIn = runs.reduce((s, r) => s + r.metrics.tokensIn, 0);
  const tokensOut = runs.reduce((s, r) => s + r.metrics.tokensOut, 0);
  const awaiting = runs.filter((r) => r.status === "awaiting_approval").length;
  const pendingApprovals = runs.reduce((s, r) => s + (r.metrics.approvalCount ?? 0), 0);
  // approximate escalate: tags or awaiting + denied
  const escalated = runs.filter(
    (r) => r.status === "awaiting_approval" || r.status === "denied",
  ).length;
  const jevEscalatePct = runs.length ? escalated / runs.length : 0;

  return {
    totalCost,
    p95,
    tokensIn,
    tokensOut,
    awaiting,
    pendingApprovals,
    jevEscalatePct,
    evalPassRate: evalReport?.passRate ?? null,
    evalGate: evalReport?.gate ?? null,
    runCount: runs.length,
  };
}

export function toolMixFromRuns(runs: AgentRun[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of runs) {
    for (const t of r.toolCalls) {
      map.set(t.toolName, (map.get(t.toolName) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function a2aCount(runs: AgentRun[]): number {
  let n = 0;
  for (const r of runs) {
    for (const e of r.timeline) {
      if (e.kind === "agent_message") n += 1;
    }
    for (const a of r.auditLog) {
      if (a.type === "agent.message") n += 1;
    }
  }
  return n;
}

/** Chronological fleet cost/latency series for spark-in-tile (Demo Mode ≥8 pts). */
export function fleetSeries(
  runs: Array<{ createdAt: string; metrics: { totalCostUsd: number; totalLatencyMs: number } }>,
): { cost: number[]; latency: number[] } {
  const sorted = [...runs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  if (sorted.length === 0) {
    const cost: number[] = [];
    const latency: number[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const eased = t * t * (3 - 2 * t);
      cost.push(Number((0.12 * eased).toFixed(5)));
      latency.push(Math.round(2400 * eased));
    }
    return { cost, latency };
  }
  let c = 0;
  let l = 0;
  const cost: number[] = [0];
  const latency: number[] = [0];
  for (const r of sorted) {
    c += r.metrics.totalCostUsd;
    l += r.metrics.totalLatencyMs;
    cost.push(Number(c.toFixed(5)));
    latency.push(l);
  }
  const targetC = c;
  const targetL = l;
  while (cost.length < 8) {
    const i = cost.length;
    const prevC = cost[i - 1] ?? 0;
    const prevL = latency[i - 1] ?? 0;
    cost.push(Number((prevC + (targetC - prevC) * 0.35).toFixed(5)));
    latency.push(Math.round(prevL + (targetL - prevL) * 0.35));
  }
  cost[cost.length - 1] = Number(targetC.toFixed(5));
  latency[latency.length - 1] = targetL;
  return { cost, latency };
}
