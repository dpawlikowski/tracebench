import { describe, it, expect } from "vitest";
import { MockJevAdapter } from "@tracebench/agent-runtime";
import {
  RUN_SUCCESS_APPROVED,
  RUN_EVAL_REGRESSION,
  RUN_AWAITING_APPROVAL,
  SEEDED_RUNS,
} from "@tracebench/fixtures";
import { GOLDEN_SET } from "./golden";
import {
  EVAL_JEV_THRESHOLDS,
  interpretJevEval,
  scoreCaseWithJev,
  toEvalScoreState,
} from "./jev-scorer";
import { releaseGate, runSuite } from "./scorer";

describe("mock jev eval scoring policy", () => {
  const adapter = new MockJevAdapter();

  it("tags results as mock-jev", async () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_001")!;
    const result = await scoreCaseWithJev(c, RUN_SUCCESS_APPROVED, adapter);
    expect(result.scorerSource).toBe("mock-jev");
    expect(result.passed).toBe(true);
    expect(result.jev?.policyOk).toBeGreaterThan(EVAL_JEV_THRESHOLDS.minPolicyOk);
    expect(result.jev?.costAnomaly).toBeLessThan(EVAL_JEV_THRESHOLDS.maxCostAnomaly);
  });

  it("flags cost_anomaly on intentional regression fixtures", async () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_011")!;
    const result = await scoreCaseWithJev(c, RUN_EVAL_REGRESSION, adapter);
    expect(result.passed).toBe(false);
    expect(result.jev?.costAnomaly).toBeGreaterThanOrEqual(
      EVAL_JEV_THRESHOLDS.maxCostAnomaly,
    );
    expect(result.failures.some((f) => f.includes("cost"))).toBe(true);
  });

  it("passes awaiting-approval safety cases", async () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_013")!;
    const result = await scoreCaseWithJev(c, RUN_AWAITING_APPROVAL, adapter);
    expect(result.passed).toBe(true);
    expect(result.jev?.policyOk).toBeGreaterThan(0.5);
  });

  it("builds JSON-serializable EvalScoreState", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_009")!;
    const state = toEvalScoreState(c, RUN_SUCCESS_APPROVED);
    expect(() => JSON.stringify(state)).not.toThrow();
    expect(state.caseId).toBe("eval_009");
    expect(state.actual.costUsd).toBe(RUN_SUCCESS_APPROVED.metrics.totalCostUsd);
  });

  it("interpretJevEval fails closed on low policy_ok", () => {
    const c = GOLDEN_SET.find((x) => x.id === "eval_001")!;
    const result = interpretJevEval(
      c,
      RUN_SUCCESS_APPROVED,
      {
        source: "mock",
        answers: {
          policy_ok: { type: "boolean", probability: 0.1 },
          faithfulness_proxy: { type: "score", score: 2.9 },
          cost_anomaly: { type: "boolean", probability: 0.05 },
        },
      },
      "mock-jev",
    );
    expect(result.passed).toBe(false);
  });

  it("release gate stays PASS with expect-fail cost regressions under mock-jev", async () => {
    const report = await runSuite(GOLDEN_SET, SEEDED_RUNS, { adapter });
    expect(report.scorerSource).toBe("mock-jev");
    const expectFail = report.results.filter((r) => {
      const c = GOLDEN_SET.find((x) => x.id === r.caseId);
      return c?.tags.includes("expect-fail");
    });
    expect(expectFail.length).toBeGreaterThan(0);
    expect(expectFail.every((r) => !r.passed)).toBe(true);
    expect(releaseGate(report, GOLDEN_SET)).toBe("pass");
  });
});
