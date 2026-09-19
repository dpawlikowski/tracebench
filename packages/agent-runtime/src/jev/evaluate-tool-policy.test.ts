import { describe, expect, it } from "vitest";
import { Experimental_EvaluationMockModelV4 } from "ai/test";
import { TOOL_CATALOG } from "@tracebench/fixtures";
import { MockJevAdapter } from "./mock-jev-adapter";
import { LiveJevAdapter } from "./live-jev-adapter";
import { createJevAdapter } from "./create-jev-adapter";
import { evaluateToolPolicy } from "./evaluate-tool-policy";
import type { ToolPolicyInput } from "@tracebench/schemas";

function inputFor(toolName: string, overrides?: Partial<ToolPolicyInput>): ToolPolicyInput {
  const tool = TOOL_CATALOG.find((t) => t.name === toolName);
  if (!tool) throw new Error(`unknown tool ${toolName}`);
  return {
    toolName: tool.name,
    catalogRisk: tool.risk,
    irreversible: tool.irreversible,
    args: {},
    runGoal: "fixture goal",
    ...overrides,
  };
}

describe("MockJevAdapter (default)", () => {
  const adapter = new MockJevAdapter();

  it("is the createJevAdapter default", () => {
    expect(createJevAdapter().kind).toBe("mock");
    expect(createJevAdapter({ kind: "mock" }).kind).toBe("mock");
  });

  it("auto-allows low-risk catalog tools", async () => {
    const { decision, evaluationSource } = await evaluateToolPolicy(
      inputFor("search_docs"),
      adapter,
    );
    expect(evaluationSource).toBe("mock");
    expect(decision.action).toBe("auto_allow");
    expect(decision.evaluatedRisk).toBe("low");
  });

  it("escalates medium-risk tools to HITL", async () => {
    const { decision } = await evaluateToolPolicy(inputFor("draft_email"), adapter);
    expect(decision.action).toBe("escalate_hitl");
  });

  it("escalates high-risk irreversible tools to HITL", async () => {
    const { decision } = await evaluateToolPolicy(inputFor("execute_payment"), adapter);
    expect(decision.action).toBe("escalate_hitl");
    expect(decision.reason).toMatch(/high-risk|Irreversible/i);
  });
});

describe("LiveJevAdapter with Experimental_EvaluationMockModelV4", () => {
  it("auto-allows when mock model returns clear low-risk answers", async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => ({
        answers: {
          riskTier: {
            type: "choice",
            choice: "low",
            probabilities: { low: 0.94, medium: 0.04, high: 0.02 },
          },
          safeToAutoAllow: { type: "boolean", probability: 0.96 },
          severity: {
            type: "score",
            score: 0.2,
            probabilities: { "0": 0.85, "1": 0.1, "2": 0.05, "3": 0 },
          },
        },
        warnings: [],
        providerMetadata: {
          typesafe: { confidence: { riskTier: 0.91, severity: 0.8 } },
        },
      }),
    });

    const adapter = new LiveJevAdapter({ model });
    const { decision, evaluationSource } = await evaluateToolPolicy(
      inputFor("list_accounts"),
      adapter,
    );
    expect(evaluationSource).toBe("live");
    expect(decision.action).toBe("auto_allow");
  });

  it("escalates when confidence metadata is missing (fail soft → HITL)", async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => ({
        answers: {
          riskTier: {
            type: "choice",
            choice: "low",
            probabilities: { low: 0.94, medium: 0.04, high: 0.02 },
          },
          safeToAutoAllow: { type: "boolean", probability: 0.96 },
          severity: {
            type: "score",
            score: 0.2,
            probabilities: { "0": 0.85, "1": 0.1, "2": 0.05, "3": 0 },
          },
        },
        warnings: [],
      }),
    });

    const adapter = new LiveJevAdapter({ model });
    const { decision } = await evaluateToolPolicy(inputFor("search_docs"), adapter);
    expect(decision.action).toBe("escalate_hitl");
  });

  it("fail-closes (deny) when evaluate throws for high-risk tools", async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => {
        throw new Error("OIDC token expired");
      },
    });

    const adapter = new LiveJevAdapter({ model });
    const { decision } = await evaluateToolPolicy(inputFor("deploy_config"), adapter);
    expect(decision.action).toBe("deny");
    expect(decision.reason).toMatch(/fail-closed|OIDC/i);
  });
});
