"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, EmptyState, Spinner } from "@tracebench/ui";
import { HelpTip } from "@/components/help/HelpTip";
import type { ToolGateDecision, ToolDefinition } from "@tracebench/schemas";

type MatrixRow = {
  tool: ToolDefinition;
  decision: ToolGateDecision;
  evaluationSource: "mock" | "live";
};

type MatrixResponse = {
  adapter: "mock" | "live";
  rows: MatrixRow[];
};

function actionTone(action: ToolGateDecision["action"]): "success" | "warning" | "danger" {
  if (action === "auto_allow") return "success";
  if (action === "deny") return "danger";
  return "warning";
}

function riskTone(risk: string): "low" | "medium" | "high" {
  if (risk === "high") return "high";
  if (risk === "medium") return "medium";
  return "low";
}

async function fetchMatrix(): Promise<MatrixResponse> {
  const res = await fetch("/api/policy/evaluate");
  if (!res.ok) throw new Error("Failed to load policy matrix");
  return (await res.json()) as MatrixResponse;
}

export function RiskPolicyMatrix() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["policy-matrix"],
    queryFn: fetchMatrix,
  });

  return (
    <div className="tb-page">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="tb-section-label m-0 mb-2">Governance</p>
          <div className="flex items-center gap-2">
            <h1 className="tb-title m-0">Risk policy matrix</h1>
            <HelpTip title="Jev risk policy" body="Each OpsAgent tool is evaluated by the Jev adapter (mock by default). Actions: auto_allow, require_approval, or deny." href="/help/hitl-jev" />
          </div>
          <p className="tb-subtitle mt-1.5 max-w-2xl">
            TypeSafe <strong>Jev</strong> evaluates each OpsAgent tool (
            <code className="font-mono text-[12px]">choice</code> /{" "}
            <code className="font-mono text-[12px]">boolean</code> /{" "}
            <code className="font-mono text-[12px]">score</code>). High confidence + low risk →
            auto-allow; otherwise escalate to HITL. Live errors fail closed for high-risk tools.
            Default adapter: <code className="font-mono text-[12px]">MockJevAdapter</code> (zero
            keys).
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Re-evaluate"}
        </Button>
      </div>

      {isLoading && <Spinner label="Evaluating tool catalog" />}
      {isError && (
        <EmptyState
          title="Policy evaluation failed"
          description="The /api/policy/evaluate endpoint did not respond."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {data && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="accent">adapter: {data.adapter}</Badge>
            <Badge tone="neutral">{data.rows.length} tools</Badge>
            <Badge tone="success">
              auto-allow {data.rows.filter((r) => r.decision.action === "auto_allow").length}
            </Badge>
            <Badge tone="warning">
              HITL {data.rows.filter((r) => r.decision.action === "escalate_hitl").length}
            </Badge>
            <Badge tone="danger">
              deny {data.rows.filter((r) => r.decision.action === "deny").length}
            </Badge>
          </div>

          <Card className="overflow-hidden p-0" padding={0}>
            <div className="tb-table-wrap">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]" data-testid="policy-table">
              <thead>
                <tr className="border-b border-tb-border text-[11px] uppercase tracking-wide text-tb-text-dim">
                  <th className="px-4 py-3 font-semibold">Tool</th>
                  <th className="px-4 py-3 font-semibold">Catalog risk</th>
                  <th className="px-4 py-3 font-semibold">Jev risk</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Gate</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.tool.name} className="border-b border-tb-border/70 align-top transition-colors hover:bg-tb-bg-hover/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-tb-text">{row.tool.name}</div>
                      <div className="mt-0.5 text-[12px] text-tb-text-muted">
                        {row.tool.description}
                      </div>
                      {row.tool.irreversible && (
                        <Badge tone="danger" className="mt-1.5">
                          irreversible
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={riskTone(row.tool.risk)}>{row.tool.risk}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {row.decision.evaluatedRisk ? (
                        <Badge tone={riskTone(row.decision.evaluatedRisk)}>
                          {row.decision.evaluatedRisk}
                        </Badge>
                      ) : (
                        <span className="text-tb-text-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-tb-text-muted">
                      {row.decision.riskConfidence != null
                        ? row.decision.riskConfidence.toFixed(2)
                        : "—"}
                      {row.decision.safeProbability != null && (
                        <div className="text-tb-text-dim">
                          P(safe) {row.decision.safeProbability.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={actionTone(row.decision.action)}>
                        {row.decision.action.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-[12px] leading-snug text-tb-text-muted">
                      {row.decision.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Card className="mt-5 p-4 text-[13px] text-tb-text-muted">
            <div className="font-semibold text-tb-text">Talk track</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Questions stay atomic (risk tier choice, safe-to-auto-allow boolean, severity
                score) — branching lives in <code className="font-mono text-[12px]">decideToolGate</code>.
              </li>
              <li>
                Confidence comes from{" "}
                <code className="font-mono text-[12px]">
                  providerMetadata.typesafe.confidence
                </code>
                ; missing confidence never auto-allows.
              </li>
              <li>
                <code className="font-mono text-[12px]">MockJevAdapter</code> is default;{" "}
                <code className="font-mono text-[12px]">LiveJevAdapter</code> needs{" "}
                <code className="font-mono text-[12px]">JEV_ADAPTER=live</code> +{" "}
                <code className="font-mono text-[12px]">vercel env pull</code>.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
