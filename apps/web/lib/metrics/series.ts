import type { AgentRun } from "@tracebench/schemas";

/** Cumulative cost / latency series for sparklines (Demo Mode always ≥8 pts). */
export function seriesFromRun(run: AgentRun): { cost: number[]; latency: number[] } {
  const tools = run.toolCalls.filter((t) => t.latencyMs !== undefined);
  if (tools.length === 0) {
    const c = Math.max(run.metrics.totalCostUsd, 0.001);
    const l = Math.max(run.metrics.totalLatencyMs, 100);
    const steps = 8;
    const cost: number[] = [];
    const latency: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const eased = t * t * (3 - 2 * t);
      cost.push(Number((c * eased).toFixed(5)));
      latency.push(Math.round(l * eased));
    }
    return { cost, latency };
  }
  let cost = 0;
  let lat = 0;
  const costSeries: number[] = [0];
  const latSeries: number[] = [0];
  const perToolCost = run.metrics.totalCostUsd / Math.max(1, tools.length);
  for (const t of tools) {
    cost += perToolCost;
    lat += t.latencyMs ?? 0;
    costSeries.push(Number(cost.toFixed(5)));
    latSeries.push(lat);
  }
  costSeries[costSeries.length - 1] = run.metrics.totalCostUsd;
  while (costSeries.length < 8) {
    const i = costSeries.length;
    const prevC = costSeries[i - 1] ?? 0;
    const prevL = latSeries[i - 1] ?? 0;
    const targetC = run.metrics.totalCostUsd;
    const targetL = run.metrics.totalLatencyMs;
    costSeries.push(Number((prevC + (targetC - prevC) * 0.35).toFixed(5)));
    latSeries.push(Math.round(prevL + (targetL - prevL) * 0.35));
  }
  costSeries[costSeries.length - 1] = run.metrics.totalCostUsd;
  latSeries[latSeries.length - 1] = run.metrics.totalLatencyMs;
  return { cost: costSeries, latency: latSeries };
}
