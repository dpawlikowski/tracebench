import { describe, it, expect, beforeEach } from "vitest";
import { SEEDED_RUNS } from "@tracebench/fixtures";
import { timelineEventToDomain } from "@tracebench/domain";
import type { DomainEvent } from "@tracebench/domain";
import {
  FixtureOpsTelemetry,
  projectSpansFromRun,
  projectSpansFromEvents,
  resetOpsTelemetry,
  createOpsTelemetry,
} from "./index";

describe("projectSpansFromRun", () => {
  it("maps invoke_agent + chat + execute_tool + tool_approval", () => {
    const run = SEEDED_RUNS.find((r) => r.id === "run_pay_vendor_ok")!;
    expect(run).toBeTruthy();
    const spans = projectSpansFromRun(run);
    const names = new Set(spans.map((s) => s.name));
    expect(names.has("invoke_agent")).toBe(true);
    expect(names.has("chat")).toBe(true);
    expect(names.has("execute_tool")).toBe(true);
    expect(names.has("tool_approval")).toBe(true);
    expect(spans.filter((s) => s.name === "execute_tool")).toHaveLength(run.toolCalls.length);
    expect(spans.filter((s) => s.name === "tool_approval")).toHaveLength(run.approvals.length);
    expect(spans.find((s) => s.name === "execute_tool")?.attributes?.tool_name).toBeTruthy();
  });

  it("includes cost/tokens when present", () => {
    const run = SEEDED_RUNS.find((r) => r.id === "run_pay_vendor_ok")!;
    const spans = projectSpansFromRun(run);
    expect(
      spans.some(
        (s) =>
          s.name === "execute_tool" && s.attributes?.["gen_ai.usage.cost_usd"] !== undefined,
      ),
    ).toBe(true);
  });
});

describe("projectSpansFromEvents", () => {
  it("projects from timeline→domain events", () => {
    const run = SEEDED_RUNS.find((r) => r.id === "run_pay_vendor_ok")!;
    const events: DomainEvent[] = [
      {
        type: "RunStarted",
        at: run.startedAt ?? run.createdAt,
        runId: run.id,
        title: run.title,
        goal: run.goal,
        agentName: run.agentName,
      },
    ];
    for (const step of run.replayPlan) {
      const te = run.timeline.find((e) => e.id === step.eventId);
      if (!te) continue;
      const de = timelineEventToDomain(te, run);
      if (de) events.push(de);
    }
    const spans = projectSpansFromEvents(events, run.id);
    expect(spans.some((s) => s.name === "invoke_agent")).toBe(true);
    expect(spans.some((s) => s.name === "chat")).toBe(true);
  });
});

describe("FixtureOpsTelemetry", () => {
  beforeEach(() => resetOpsTelemetry());

  it("lists summaries with span counts", async () => {
    const tel = new FixtureOpsTelemetry();
    const list = await tel.listRunSummaries();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]!.spanCount).toBeGreaterThan(0);
    expect(list[0]!.byName.invoke_agent).toBeGreaterThanOrEqual(1);
  });

  it("returns empty for unknown run", async () => {
    expect(await new FixtureOpsTelemetry().getSpansForRun("missing")).toEqual([]);
  });

  it("factory defaults to fixture", () => {
    expect(createOpsTelemetry({ kind: "fixture" }).kind).toBe("fixture");
  });
});
