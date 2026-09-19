import {
  experimental_evaluate,
  type Experimental_EvaluationModel,
} from "ai";
import type { RiskTier, ToolPolicyInput } from "@tracebench/schemas";
import type { JevRiskEvaluation } from "@tracebench/domain";
import type { JevAdapter } from "./ports";
import { TOOL_RISK_QUESTIONS } from "./questions";
import { EVAL_SCORE_QUESTIONS } from "./eval-questions";
import type { EvalScoreState, JevEvalEvaluation } from "./eval-types";
import { mockEvalEvaluation } from "./mock-eval-score";

const DEFAULT_MODEL: Experimental_EvaluationModel = "typesafe-ai/jev";

export type LiveJevAdapterOptions = {
  /**
   * Evaluation model. Defaults to `typesafe-ai/jev` via AI Gateway.
   * Inject Experimental_EvaluationMockModelV4 in unit tests.
   */
  model?: Experimental_EvaluationModel;
};

/**
 * Optional live adapter — requires Vercel AI Gateway OIDC (`vercel env pull`).
 * Not the default. On failure, returns an errored evaluation so policy can fail closed.
 */
export class LiveJevAdapter implements JevAdapter {
  readonly kind = "live" as const;
  private readonly model: Experimental_EvaluationModel;

  constructor(opts: LiveJevAdapterOptions = {}) {
    this.model = opts.model ?? DEFAULT_MODEL;
  }

  async evaluateToolRisk(input: ToolPolicyInput): Promise<JevRiskEvaluation> {
    try {
      // Evaluation state must be JSON-serializable (JSONValue).
      const state = {
        toolName: input.toolName,
        catalogRisk: input.catalogRisk,
        irreversible: input.irreversible,
        args: JSON.parse(JSON.stringify(input.args ?? {})) as Record<
          string,
          string | number | boolean | null
        >,
        runGoal: input.runGoal ?? null,
        agentThought: input.agentThought ?? null,
      };

      const result = await experimental_evaluate({
        model: this.model,
        state,
        questions: TOOL_RISK_QUESTIONS,
        providerOptions: {
          gateway: { zeroDataRetention: true },
        },
      });

      const { riskTier, safeToAutoAllow, severity } = result.answers;
      const confidence = (
        result.providerMetadata as
          | { typesafe?: { confidence?: Record<string, number> } }
          | undefined
      )?.typesafe?.confidence;

      if (
        riskTier.type !== "choice" ||
        safeToAutoAllow.type !== "boolean" ||
        severity.type !== "score"
      ) {
        return {
          source: "live",
          error: "Unexpected answer shape from Jev",
          confidence: {},
          answers: fallbackAnswers(input.catalogRisk),
        };
      }

      const choice = riskTier.choice as RiskTier;
      if (choice !== "low" && choice !== "medium" && choice !== "high") {
        return {
          source: "live",
          error: `Invalid riskTier choice: ${String(riskTier.choice)}`,
          confidence: {},
          answers: fallbackAnswers(input.catalogRisk),
        };
      }

      return {
        source: "live",
        confidence: {
          riskTier: confidence?.riskTier,
          severity: confidence?.severity,
        },
        answers: {
          riskTier: {
            type: "choice",
            choice,
            probabilities: riskTier.probabilities as
              | Partial<Record<RiskTier, number>>
              | undefined,
          },
          safeToAutoAllow: {
            type: "boolean",
            probability: safeToAutoAllow.probability,
          },
          severity: {
            type: "score",
            score: severity.score,
            probabilities: severity.probabilities,
          },
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        source: "live",
        error: message,
        confidence: {},
        answers: fallbackAnswers(input.catalogRisk),
      };
    }
  }

  async evaluateGoldenCase(state: EvalScoreState): Promise<JevEvalEvaluation> {
    try {
      const serializable = JSON.parse(JSON.stringify(state)) as EvalScoreState;
      const result = await experimental_evaluate({
        model: this.model,
        state: serializable,
        questions: EVAL_SCORE_QUESTIONS,
        providerOptions: {
          gateway: { zeroDataRetention: true },
        },
      });

      const { policy_ok, faithfulness_proxy, cost_anomaly } = result.answers;
      const confidence = (
        result.providerMetadata as
          | { typesafe?: { confidence?: Record<string, number> } }
          | undefined
      )?.typesafe?.confidence;

      if (
        policy_ok.type !== "boolean" ||
        faithfulness_proxy.type !== "score" ||
        cost_anomaly.type !== "boolean"
      ) {
        return {
          ...mockEvalEvaluation(state),
          source: "live",
          error: "Unexpected eval answer shape from Jev",
        };
      }

      return {
        source: "live",
        confidence: {
          faithfulness_proxy: confidence?.faithfulness_proxy,
        },
        answers: {
          policy_ok: {
            type: "boolean",
            probability: policy_ok.probability,
          },
          faithfulness_proxy: {
            type: "score",
            score: faithfulness_proxy.score,
            probabilities: faithfulness_proxy.probabilities,
          },
          cost_anomaly: {
            type: "boolean",
            probability: cost_anomaly.probability,
          },
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Fail soft toward mock analysis so release gate stays usable offline.
      return {
        ...mockEvalEvaluation(state),
        source: "live",
        error: message,
      };
    }
  }
}

function fallbackAnswers(catalogRisk: RiskTier): JevRiskEvaluation["answers"] {
  return {
    riskTier: {
      type: "choice",
      choice: catalogRisk,
      probabilities: { low: 0, medium: 0, high: 0, [catalogRisk]: 1 },
    },
    safeToAutoAllow: { type: "boolean", probability: 0 },
    severity: { type: "score", score: catalogRisk === "high" ? 3 : 1.5 },
  };
}
