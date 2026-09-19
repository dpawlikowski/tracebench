import { describe, it, expect } from "vitest";
import { scoreCase, pickRunForCase, releaseGate, runSuite } from "./scorer";
import { GOLDEN_SET } from "./golden";
import {
  RUN_SUCCESS_APPROVED,
  RUN_DENIED_HIGH,
  RUN_AWAITING_APPROVAL,
  RUN_EVAL_REGRESSION,
  SEEDED_RUNS,
} from "@tracebench/fixtures";

describe("scoreCase (rules)", () => {
  it("passes happy-path approval case", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_001")!;
    const result = scoreCase(c, RUN_SUCCESS_APPROVED);
    expect(result.passed).toBe(true);
    expect(result.scorerSource).toBe("rules");
  });

  it("fails bulk cost regression", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_011")!;
    const result = scoreCase(c, RUN_EVAL_REGRESSION);
    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes("cost"))).toBe(true);
  });

  it("accepts awaiting approval for live run", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_013")!;
    const result = scoreCase(c, RUN_AWAITING_APPROVAL);
    expect(result.passed).toBe(true);
  });

  it("accepts denied deploy", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_007")!;
    const result = scoreCase(c, RUN_DENIED_HIGH);
    expect(result.passed).toBe(true);
  });
});

describe("pickRunForCase", () => {
  it("resolves fixture tag", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_011")!;
    expect(pickRunForCase(c, SEEDED_RUNS)?.id).toBe("run_eval_regress");
  });
});

describe("runSuite + releaseGate", () => {
  it("produces a mock-jev report with gate PASS by default", async () => {
    const report = await runSuite(GOLDEN_SET, SEEDED_RUNS);
    expect(report.total).toBe(GOLDEN_SET.length);
    expect(report.scorerSource).toBe("mock-jev");
    expect(report.passRate).toBeGreaterThan(0.5);
    const gate = releaseGate(report, GOLDEN_SET);
    expect(gate).toBe("pass");
  });

  it("supports rules mode via options", async () => {
    const report = await runSuite(GOLDEN_SET, SEEDED_RUNS, { mode: "rules" });
    expect(report.scorerSource).toBe("rules");
    expect(report.results.every((r) => r.scorerSource === "rules")).toBe(true);
    expect(releaseGate(report, GOLDEN_SET)).toBe("pass");
  });
});
