import { NextResponse } from "next/server";
import { getOpsTelemetryPort } from "@/lib/ops-telemetry";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const tel = getOpsTelemetryPort();
  const spans = await tel.getSpansForRun(id);
  if (spans.length === 0) {
    return NextResponse.json(
      { kind: tel.kind, runId: id, spans: [], message: "No spans (unknown run or empty)" },
      { status: 200 },
    );
  }
  return NextResponse.json({ kind: tel.kind, runId: id, spans });
}
