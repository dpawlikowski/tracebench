"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { EvalCase, EvalSuiteReport } from "@tracebench/schemas";
import { Badge, Button, EmptyState, Panel, Stat } from "@tracebench/ui";
import { HelpTip } from "@/components/help/HelpTip";

const RESULT_FILTERS = ["all", "pass", "fail"] as const;

function formatJevHint(r: EvalSuiteReport["results"][number]): string | null {
  if (!r.jev) return null;
  const parts: string[] = [];
  if (r.jev.policyOk !== undefined) parts.push(`P(ok)=${r.jev.policyOk.toFixed(2)}`);
  if (r.jev.faithfulness !== undefined)
    parts.push(`faith=${r.jev.faithfulness.toFixed(1)}`);
  if (r.jev.costAnomaly !== undefined && r.jev.costAnomaly >= 0.5)
    parts.push(`cost↑`);
  return parts.length ? parts.join(" · ") : null;
}

export function EvalScorecard({
  report,
  cases,
}: {
  report: EvalSuiteReport;
  cases: EvalCase[];
}) {
  const byId = new Map(cases.map((c) => [c.id, c]));
  const [result, setResult] = useQueryState(
    "result",
    parseAsStringLiteral(RESULT_FILTERS).withDefault("all"),
  );

  const rows = report.results.filter((r) => {
    if (result === "all") return true;
    if (result === "pass") return r.passed;
    return !r.passed;
  });

  return (
    <div className="flex flex-col tb-section-gap">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel title="Release gate" action={<HelpTip title="Release gate" body="Golden cases scored by mock-jev (default). Gate fails on unexpected regressions. Filter via URL for shareable links." href="/help/evals-release-gate" />}>
          <Stat
            label="Gate"
            value={report.gate === "pass" ? "PASS" : "FAIL"}
            hint={report.suiteName}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={report.gate === "pass" ? "success" : "danger"}>{report.gate}</Badge>
            {report.scorerSource && (
              <Badge tone="neutral" data-testid="scorer-source">
                {report.scorerSource}
              </Badge>
            )}
          </div>
        </Panel>
        <Panel title="Pass rate">
          <Stat label="Rate" value={`${(report.passRate * 100).toFixed(1)}%`} />
        </Panel>
        <Panel title="Totals">
          <Stat label="Passed / Failed" value={`${report.passed} / ${report.failed}`} />
        </Panel>
        <Panel title="Cases">
          <Stat label="Golden set" value={String(report.total)} />
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="evals-result-filters">
        {RESULT_FILTERS.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={result === r ? "primary" : "ghost"}
            onClick={() => void setResult(r)}
            data-testid={`filter-result-${r}`}
          >
            {r === "all" ? "All results" : r}
          </Button>
        ))}
      </div>

      <Panel title={`Golden set (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            title="No cases match this filter"
            description={
              result === "all"
                ? "The golden set is empty."
                : `No ${result} results. Clear the filter to see the full suite.`
            }
            action={
              result !== "all" ? (
                <Button variant="secondary" onClick={() => void setResult("all")}>
                  Clear filter
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="tb-table-wrap -mx-1">
            <table data-testid="eval-table" className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-tb-text-dim">
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const c = byId.get(r.caseId);
                  const expectFail = c?.tags.includes("expect-fail");
                  const jevHint = formatJevHint(r);
                  const note =
                    r.failures[0] ??
                    (expectFail && !r.passed ? "intentional regression" : null);
                  return (
                    <tr key={r.caseId} className="border-t border-tb-border">
                      <td className="px-2.5 py-2.5 align-top">
                        <code className="font-mono text-[11px]">{r.caseId}</code>
                      </td>
                      <td className="px-2.5 py-2.5 align-top">{c?.name ?? r.caseId}</td>
                      <td className="px-2.5 py-2.5 align-top">{c?.category}</td>
                      <td className="px-2.5 py-2.5 align-top">
                        <Badge
                          tone={
                            c?.severity === "blocker"
                              ? "danger"
                              : c?.severity === "major"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {c?.severity ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2.5 align-top">
                        <Badge tone={r.passed ? "success" : expectFail ? "warning" : "danger"}>
                          {r.passed ? "pass" : expectFail ? "fail (expected)" : "fail"}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2.5 align-top font-mono tabular-nums">
                        {r.score.toFixed(2)}
                      </td>
                      <td className="max-w-[280px] px-2.5 py-2.5 align-top text-tb-text-muted">
                        <div>{note ?? "—"}</div>
                        {jevHint && (
                          <div className="mt-0.5 font-mono text-[11px] text-tb-text-dim">
                            {jevHint}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
