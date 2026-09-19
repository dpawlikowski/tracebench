import { NextResponse } from "next/server";
import { GOLDEN_SET, runSuite, releaseGate } from "@tracebench/evals";
import { SEEDED_RUNS } from "@tracebench/fixtures";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await runSuite(GOLDEN_SET, SEEDED_RUNS);
  const gate = releaseGate(report, GOLDEN_SET);
  return NextResponse.json({
    report: { ...report, gate },
    cases: GOLDEN_SET,
  });
}
