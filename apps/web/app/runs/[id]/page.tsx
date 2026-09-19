import Link from "next/link";
import { Button, EmptyState } from "@tracebench/ui";
import { getRun } from "@/lib/store";
import { RunDetail } from "@/components/runs/RunDetail";

export const dynamic = "force-dynamic";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRun(id);

  if (!run) {
    return (
      <div className="p-12">
        <EmptyState
          title="Run not found"
          description={`No seeded run with id “${id}”.`}
          action={
            <Link href="/runs">
              <Button variant="secondary">Back to runs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <RunDetail initialRun={run} />;
}
