import type { AgentRun } from "@tracebench/schemas";
import { SEEDED_RUNS, getRunById as fixtureGet } from "@tracebench/fixtures";
import type { OpsTelemetry } from "./ports";
import type { OpsRunSpanSummary, OpsSpan } from "./types";
import { projectSpansFromRun, summarizeRun } from "./project-spans";

/** Demo Mode — spans from fixture AgentRuns. Zero keys. */
export class FixtureOpsTelemetry implements OpsTelemetry {
  readonly kind = "fixture" as const;
  private runs: AgentRun[];

  constructor(seed?: AgentRun[]) {
    this.runs = seed ? structuredClone(seed) : structuredClone(SEEDED_RUNS);
  }

  reset(): void {
    this.runs = structuredClone(SEEDED_RUNS);
  }

  private resolve(runId: string): AgentRun | undefined {
    return this.runs.find((r) => r.id === runId) ?? fixtureGet(runId);
  }

  async getSpansForRun(runId: string): Promise<OpsSpan[]> {
    const run = this.resolve(runId);
    if (!run) return [];
    return projectSpansFromRun(run);
  }

  async listRunSummaries(): Promise<OpsRunSpanSummary[]> {
    return this.runs.map((run) => summarizeRun(run, projectSpansFromRun(run)));
  }
}

let singleton: FixtureOpsTelemetry | undefined;

export function getFixtureOpsTelemetry(): FixtureOpsTelemetry {
  if (!singleton) singleton = new FixtureOpsTelemetry();
  return singleton;
}

export function resetFixtureOpsTelemetry(): void {
  singleton = undefined;
}
