import { notFound } from "next/navigation";
import { getRun } from "@/lib/store";
import { RunGraphPageClient } from "@/components/graph/RunGraphPageClient";

export const dynamic = "force-dynamic";

export default async function RunGraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) notFound();
  return <RunGraphPageClient run={run} />;
}
