import type { RiskTier, ToolGateDecision } from "@tracebench/schemas";

/**
 * Thresholds for auto-allow. Tunable; keep strict for irreversible tools.
 * Confidence comes from result.providerMetadata.typesafe.confidence (choice/score).
 */
export const TOOL_GATE_THRESHOLDS = {
  /** Minimum typesafe confidence on riskTier before trusting the choice. */
  minRiskConfidence: 0.6,
  /** Minimum probability mass on the selected riskTier option. */
  minRiskProbability: 0.7,
  /** Minimum P(true) that the call is safe to auto-allow. */
  minSafeProbability: 0.8,
  /** Max severity score (0-indexed rubric) allowed for auto-allow. */
  maxSeverityForAutoAllow: 1.0,
} as const;

export type JevRiskAnswers = {
  riskTier: {
    type: "choice";
    choice: RiskTier;
    probabilities?: Partial<Record<RiskTier, number>>;
  };
  safeToAutoAllow: {
    type: "boolean";
    probability: number;
  };
  severity: {
    type: "score";
    score: number;
    probabilities?: Record<string, number>;
  };
};

export type JevRiskEvaluation = {
  answers: JevRiskAnswers;
  /** providerMetadata.typesafe.confidence — choice/score only. */
  confidence?: Partial<Record<"riskTier" | "severity", number>>;
  source: "mock" | "live";
  /** Set when live evaluate failed; policy fail-closes for high-risk. */
  error?: string;
};

export type DecideToolGateInput = {
  catalogRisk: RiskTier;
  irreversible?: boolean;
  evaluation?: JevRiskEvaluation | null;
};

/**
 * Pure risk gate: high confidence + low risk → auto_allow; else escalate HITL.
 * Fail closed on live errors for high-risk / irreversible tools.
 */
export function decideToolGate(input: DecideToolGateInput): ToolGateDecision {
  const irreversible = input.irreversible ?? false;
  const catalogRisk = input.catalogRisk;
  const evaluation = input.evaluation;

  if (!evaluation) {
    if (catalogRisk === "low" && !irreversible) {
      return {
        action: "auto_allow",
        reason: "Catalog low-risk read path (no Jev evaluation).",
        catalogRisk,
        source: "catalog_only",
      };
    }
    return {
      action: "escalate_hitl",
      reason: "Missing evaluation — escalate by default.",
      catalogRisk,
      source: "catalog_only",
    };
  }

  // Live (or mock) failure: fail closed for elevated risk.
  if (evaluation.error) {
    if (catalogRisk === "high" || irreversible) {
      return {
        action: "deny",
        reason: `Jev evaluation failed (${evaluation.error}); fail-closed for high-risk/irreversible tool.`,
        catalogRisk,
        source: evaluation.source,
      };
    }
    return {
      action: "escalate_hitl",
      reason: `Jev evaluation failed (${evaluation.error}); escalate for review.`,
      catalogRisk,
      source: evaluation.source,
    };
  }

  const { riskTier, safeToAutoAllow, severity } = evaluation.answers;
  const riskConfidence = evaluation.confidence?.riskTier ?? 0;
  const riskProbability = riskTier.probabilities?.[riskTier.choice] ?? 0;
  const safeProbability = safeToAutoAllow.probability;
  const evaluatedRisk = riskTier.choice;

  const base = {
    catalogRisk,
    evaluatedRisk,
    riskConfidence,
    riskProbability,
    safeProbability,
    severityScore: severity.score,
    source: evaluation.source,
  } as const;

  // Never auto-allow catalog high-risk or irreversible tools.
  if (catalogRisk === "high" || irreversible) {
    return {
      ...base,
      action: "escalate_hitl",
      reason: irreversible
        ? "Irreversible tool — always require HITL."
        : "Catalog high-risk — always require HITL.",
    };
  }

  const clearLowRisk =
    evaluatedRisk === "low" &&
    catalogRisk === "low" &&
    riskConfidence >= TOOL_GATE_THRESHOLDS.minRiskConfidence &&
    riskProbability >= TOOL_GATE_THRESHOLDS.minRiskProbability &&
    safeProbability >= TOOL_GATE_THRESHOLDS.minSafeProbability &&
    severity.score <= TOOL_GATE_THRESHOLDS.maxSeverityForAutoAllow;

  if (clearLowRisk) {
    return {
      ...base,
      action: "auto_allow",
      reason:
        "High-confidence low-risk evaluation — auto-allow without HITL.",
    };
  }

  return {
    ...base,
    action: "escalate_hitl",
    reason: buildAmbiguityReason({
      evaluatedRisk,
      riskConfidence,
      riskProbability,
      safeProbability,
      severity: severity.score,
      catalogRisk,
    }),
  };
}

function buildAmbiguityReason(opts: {
  evaluatedRisk: RiskTier;
  riskConfidence: number;
  riskProbability: number;
  safeProbability: number;
  severity: number;
  catalogRisk: RiskTier;
}): string {
  const parts: string[] = [];
  if (opts.evaluatedRisk !== "low" || opts.catalogRisk !== "low") {
    parts.push(`risk=${opts.evaluatedRisk} (catalog=${opts.catalogRisk})`);
  }
  if (opts.riskConfidence < TOOL_GATE_THRESHOLDS.minRiskConfidence) {
    parts.push(
      `confidence ${opts.riskConfidence.toFixed(2)} < ${TOOL_GATE_THRESHOLDS.minRiskConfidence}`,
    );
  }
  if (opts.riskProbability < TOOL_GATE_THRESHOLDS.minRiskProbability) {
    parts.push(
      `P(choice) ${opts.riskProbability.toFixed(2)} < ${TOOL_GATE_THRESHOLDS.minRiskProbability}`,
    );
  }
  if (opts.safeProbability < TOOL_GATE_THRESHOLDS.minSafeProbability) {
    parts.push(
      `P(safe) ${opts.safeProbability.toFixed(2)} < ${TOOL_GATE_THRESHOLDS.minSafeProbability}`,
    );
  }
  if (opts.severity > TOOL_GATE_THRESHOLDS.maxSeverityForAutoAllow) {
    parts.push(
      `severity ${opts.severity.toFixed(2)} > ${TOOL_GATE_THRESHOLDS.maxSeverityForAutoAllow}`,
    );
  }
  return parts.length
    ? `Ambiguous / elevated risk — escalate HITL (${parts.join("; ")}).`
    : "Escalate HITL.";
}
