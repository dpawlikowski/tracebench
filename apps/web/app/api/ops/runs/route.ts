import { NextResponse } from "next/server";
import { getOpsTelemetryPort } from "@/lib/ops-telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const tel = getOpsTelemetryPort();
  const runs = await tel.listRunSummaries();
  return NextResponse.json({
    kind: tel.kind,
    runs,
  });
}
