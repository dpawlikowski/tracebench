import { Suspense } from "react";
import { Spinner } from "@tracebench/ui";
import { EvalsView } from "@/components/evals/EvalsView";

export const dynamic = "force-dynamic";

export default function EvalsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Spinner label="Loading evals" />
        </div>
      }
    >
      <EvalsView />
    </Suspense>
  );
}
