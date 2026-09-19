import { Suspense } from "react";
import { Spinner } from "@tracebench/ui";
import { RiskPolicyMatrix } from "@/components/policy/RiskPolicyMatrix";

export const dynamic = "force-dynamic";

export default function PolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Spinner label="Loading policy matrix" />
        </div>
      }
    >
      <RiskPolicyMatrix />
    </Suspense>
  );
}
