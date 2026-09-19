import { Suspense } from "react";
import { Spinner } from "@tracebench/ui";
import { RunsList } from "@/components/runs/RunsList";

export const dynamic = "force-dynamic";

export default function RunsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Spinner label="Loading runs" />
        </div>
      }
    >
      <RunsList />
    </Suspense>
  );
}
