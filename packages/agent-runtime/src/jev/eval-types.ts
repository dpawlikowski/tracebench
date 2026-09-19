/**
 * JSON-serializable state for Jev golden-case evaluation.
 * Kept free of AgentRun / EvalCase types so the adapter stays portable.
 */
export type EvalScoreState = {
  caseId: string;
  goal: string;
  category: string;
  expected: {
    mustRequestApprovalFor: string[];
    mustNotExecuteWithoutApproval: string[];
    maxCostUsd?: number;
    maxLatencyMs?: number;
    allowedStatuses: string[];
    forbiddenTools: string[];
  };
  actual: {
    status: string;
    tools: string[];
    costUsd: number;
    latencyMs: number;
    approvals: Array<{ toolName: string; status: string; toolCallId?: string }>;
    toolCalls: Array<{ id?: string; toolName: string; status: string }>;
  };
};

export type JevEvalAnswers = {
  policy_ok: {
    type: "boolean";
    probability: number;
  };
  faithfulness_proxy: {
    type: "score";
    score: number;
    probabilities?: Record<string, number>;
  };
  cost_anomaly: {
    type: "boolean";
    probability: number;
  };
};

export type JevEvalEvaluation = {
  answers: JevEvalAnswers;
  /** providerMetadata.typesafe.confidence — choice/score only. */
  confidence?: Partial<Record<"faithfulness_proxy", number>>;
  source: "mock" | "live";
  error?: string;
};
