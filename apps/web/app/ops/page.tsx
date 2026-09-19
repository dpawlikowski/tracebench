import { Suspense } from "react";
import { Spinner } from "@tracebench/ui";
import { OpsPageClient } from "@/components/ops/OpsPageClient";

export const dynamic = "force-dynamic";

export default function OpsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Spinner label="Loading ops" />
        </div>
      }
    >
      <OpsPageClient />
    </Suspense>
  );
}
