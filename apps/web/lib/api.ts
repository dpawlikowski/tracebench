import type { AgentRun, EvalCase, EvalSuiteReport, RunSummary } from "@tracebench/schemas";

export async function fetchRuns(): Promise<RunSummary[]> {
  const res = await fetch("/api/runs");
  if (!res.ok) throw new Error("Failed to load runs");
  const data = (await res.json()) as { runs: RunSummary[] };
  return data.runs;
}

export async function fetchRun(id: string): Promise<AgentRun> {
  const res = await fetch(`/api/runs/${id}`);
  if (!res.ok) throw new Error("Failed to load run");
  const data = (await res.json()) as { run: AgentRun };
  return data.run;
}

export async function postApproval(
  runId: string,
  approvalId: string,
  decision: "approved" | "denied",
  note?: string,
): Promise<AgentRun> {
  const res = await fetch(`/api/runs/${runId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvalId, decision, note }),
  });
  if (!res.ok) throw new Error("Approval request failed");
  const data = (await res.json()) as { run: AgentRun };
  return data.run;
}

export async function fetchEvals(): Promise<{
  report: EvalSuiteReport;
  cases: EvalCase[];
}> {
  const res = await fetch("/api/evals");
  if (!res.ok) throw new Error("Failed to load evals");
  return (await res.json()) as { report: EvalSuiteReport; cases: EvalCase[] };
}

export async function fetchOpsSummaries(): Promise<{
  kind: string;
  runs: import("@tracebench/agent-runtime").OpsRunSpanSummary[];
}> {
  const res = await fetch("/api/ops/runs");
  if (!res.ok) throw new Error("Failed to load ops summaries");
  return (await res.json()) as {
    kind: string;
    runs: import("@tracebench/agent-runtime").OpsRunSpanSummary[];
  };
}

export async function fetchOpsSpans(runId: string): Promise<{
  kind: string;
  runId: string;
  spans: import("@tracebench/agent-runtime").OpsSpan[];
}> {
  const res = await fetch(`/api/ops/runs/${runId}`);
  if (!res.ok) throw new Error("Failed to load ops spans");
  return (await res.json()) as {
    kind: string;
    runId: string;
    spans: import("@tracebench/agent-runtime").OpsSpan[];
  };
}
