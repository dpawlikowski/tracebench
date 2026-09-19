import { NextResponse } from "next/server";
import { listRuns } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = (await listRuns()).map((r) => ({
    id: r.id,
    title: r.title,
    goal: r.goal,
    agentName: r.agentName,
    status: r.status,
    createdAt: r.createdAt,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    tags: r.tags,
    metrics: r.metrics,
    error: r.error,
  }));
  return NextResponse.json({ runs });
}
