"use client";

import { Button, EmptyState, Spinner } from "@tracebench/ui";
import { EvalScorecard } from "@/components/evals/EvalScorecard";
import { useEvals } from "@/lib/hooks/use-evals";

export function EvalsView() {
  const { data, isLoading, isError, refetch } = useEvals();

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <div className="mb-5">
        <h1 className="m-0 text-[22px] tracking-tight">Eval / release gate</h1>
        <p className="mt-1.5 text-tb-text-muted">
          Golden set scored with <strong>mock-jev</strong> by default (zero keys). Intentional
          cost regressions are tagged{" "}
          <code className="font-mono text-[13px]">expect-fail</code>. Use{" "}
          <code className="font-mono text-[13px]">?result=pass|fail</code> for shareable links.
          Opt into live Jev via <code className="font-mono text-[13px]">JEV_ADAPTER=live</code>.
        </p>
      </div>
      {isLoading && <Spinner label="Loading eval suite" />}
      {isError && (
        <EmptyState
          tone="error"
          title="Failed to load evals"
          description="The evals API did not respond. Scorer needs packages/evals + fixtures."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}
      {data && <EvalScorecard report={data.report} cases={data.cases} />}
    </div>
  );
}
