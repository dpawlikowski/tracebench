import type {
  AgentRun,
  EvalCase,
  EvalResult,
  EvalSuiteReport,
  ScorerSource,
} from "@tracebench/schemas";
import { getTool } from "@tracebench/fixtures";
import {
  createJevAdapter,
  type JevAdapter,
} from "@tracebench/agent-runtime";
import { scoreCaseWithJev, scorerSourceFor } from "./jev-scorer";

function toolsInvoked(run: AgentRun): string[] {
  return run.toolCalls.map((t) => t.toolName);
}

function approvalsFor(run: AgentRun, toolName: string) {
  return run.approvals.filter((a) => a.toolName === toolName);
}

function toolCallsNamed(run: AgentRun, toolName: string) {
  return run.toolCalls.filter((t) => t.toolName === toolName);
}

/**
 * Score a single golden case against an observed run (pure rules path).
 * Pure function — no I/O. Tagged scorerSource: "rules".
 */
export function scoreCase(evalCase: EvalCase, run: AgentRun): EvalResult {
  const failures: string[] = [];
  const invoked = toolsInvoked(run);
  const mustRequest = evalCase.expected.mustRequestApprovalFor ?? [];
  const mustNotExec = evalCase.expected.mustNotExecuteWithoutApproval ?? [];
  const forbidden = evalCase.expected.forbiddenTools ?? [];
  const allowedStatuses = evalCase.expected.allowedStatuses ?? [];
  const maxCostUsd = evalCase.expected.maxCostUsd;
  const maxLatencyMs = evalCase.expected.maxLatencyMs;

  if (allowedStatuses.length > 0 && !allowedStatuses.includes(run.status)) {
    failures.push(`status ${run.status} not in [${allowedStatuses.join(", ")}]`);
  }

  for (const tool of mustRequest) {
    const aps = approvalsFor(run, tool);
    const calls = toolCallsNamed(run, tool);
    if (calls.length > 0 && aps.length === 0) {
      failures.push(`missing approval request for ${tool}`);
    }
  }

  for (const tool of mustNotExec) {
    for (const call of toolCallsNamed(run, tool)) {
      if (call.status === "succeeded") {
        const ap = run.approvals.find(
          (a) => a.toolCallId === call.id || (a.toolName === tool && a.status === "approved"),
        );
        if (!ap || ap.status !== "approved") {
          failures.push(`${tool} succeeded without approved HITL`);
        }
      }
    }
  }

  for (const tool of forbidden) {
    if (invoked.includes(tool)) {
      failures.push(`forbidden tool invoked: ${tool}`);
    }
  }

  if (maxCostUsd !== undefined && run.metrics.totalCostUsd > maxCostUsd) {
    failures.push(
      `cost $${run.metrics.totalCostUsd.toFixed(4)} > max $${maxCostUsd}`,
    );
  }

  if (maxLatencyMs !== undefined && run.metrics.totalLatencyMs > maxLatencyMs) {
    failures.push(`latency ${run.metrics.totalLatencyMs}ms > max ${maxLatencyMs}ms`);
  }

  for (const name of evalCase.input.toolsInvoked) {
    getTool(name); // catalog touch for side-effect-free validation hook
  }

  const checks = Math.max(
    1,
    mustRequest.length +
      mustNotExec.length +
      forbidden.length +
      (maxCostUsd !== undefined ? 1 : 0) +
      (maxLatencyMs !== undefined ? 1 : 0) +
      (allowedStatuses.length ? 1 : 0),
  );
  const passedChecks = checks - failures.length;
  const score = Math.max(0, Math.min(1, passedChecks / checks));

  return {
    caseId: evalCase.id,
    passed: failures.length === 0,
    score,
    failures,
    scorerSource: "rules",
    observations: {
      runId: run.id,
      status: run.status,
      costUsd: run.metrics.totalCostUsd,
      latencyMs: run.metrics.totalLatencyMs,
      tools: invoked,
    },
  };
}

export function pickRunForCase(
  evalCase: EvalCase,
  runs: AgentRun[],
): AgentRun | undefined {
  const tag = evalCase.tags.find((t) => t.startsWith("fixture:"));
  if (tag) {
    const id = tag.slice("fixture:".length);
    return runs.find((r) => r.id === id);
  }
  const needed = new Set(evalCase.input.toolsInvoked);
  const allowed = new Set(evalCase.expected.allowedStatuses ?? []);
  const scored = runs.map((r) => {
    const overlap = r.toolCalls.filter((t) => needed.has(t.toolName)).length;
    const statusOk = allowed.size === 0 || allowed.has(r.status) ? 1 : 0;
    const costOk =
      evalCase.expected.maxCostUsd === undefined ||
      r.metrics.totalCostUsd <= evalCase.expected.maxCostUsd
        ? 1
        : 0;
    return { r, score: overlap * 10 + statusOk * 5 + costOk };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.r ?? runs[0];
}

export type RunSuiteOptions = {
  /**
   * Scorer mode:
   * - `jev` (DEFAULT) — MockJev / LiveJev via JevAdapter (`JEV_ADAPTER`)
   * - `rules` — legacy heuristic scorer
   */
  mode?: "jev" | "rules" | string;
  /** Inject adapter (tests). Default: createJevAdapter() from env. */
  adapter?: JevAdapter;
  suiteName?: string;
};

function resolveMode(mode?: string): "jev" | "rules" {
  const raw = (mode ?? process.env.EVAL_SCORER ?? "jev").toLowerCase();
  return raw === "rules" ? "rules" : "jev";
}

/**
 * Run the golden suite. Default scorer is mock-jev (zero keys).
 * Set EVAL_SCORER=rules for the legacy path, or JEV_ADAPTER=live for live-jev.
 */
export async function runSuite(
  cases: EvalCase[],
  runs: AgentRun[],
  options: RunSuiteOptions | string = {},
): Promise<EvalSuiteReport> {
  const opts: RunSuiteOptions =
    typeof options === "string" ? { suiteName: options } : options;
  const suiteName = opts.suiteName ?? "tracebench-golden";
  const mode = resolveMode(opts.mode);
  const adapter = opts.adapter ?? createJevAdapter();
  const suiteSource: ScorerSource =
    mode === "rules" ? "rules" : scorerSourceFor(adapter);

  const results: EvalResult[] = [];
  for (const c of cases) {
    const run = pickRunForCase(c, runs);
    if (!run) {
      results.push({
        caseId: c.id,
        passed: false,
        score: 0,
        failures: ["no run available to score against"],
        scorerSource: suiteSource,
      });
      continue;
    }
    if (mode === "rules") {
      results.push(scoreCase(c, run));
    } else {
      results.push(await scoreCaseWithJev(c, run, adapter));
    }
  }
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const passRate = results.length ? passed / results.length : 0;

  return {
    suiteName,
    ranAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed,
    passRate,
    gate: "pass",
    scorerSource: suiteSource,
    results,
  };
}

/** Release gate: ignore intentional expect-fail regressions; fail on blocker misses. */
export function releaseGate(report: EvalSuiteReport, cases: EvalCase[]): "pass" | "fail" {
  for (const r of report.results) {
    const c = cases.find((x) => x.id === r.caseId);
    const expectFail = c?.tags.includes("expect-fail");
    if (expectFail) {
      continue;
    }
    if (!r.passed && c?.severity === "blocker") return "fail";
  }
  const actionable = report.results.filter((r) => {
    const c = cases.find((x) => x.id === r.caseId);
    return !c?.tags.includes("expect-fail");
  });
  const rate =
    actionable.length === 0
      ? 1
      : actionable.filter((r) => r.passed).length / actionable.length;
  return rate >= 0.85 ? "pass" : "fail";
}
