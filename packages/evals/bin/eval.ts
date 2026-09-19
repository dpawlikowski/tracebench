#!/usr/bin/env tsx
import { GOLDEN_SET } from "../src/golden";
import { runSuite, releaseGate } from "../src/scorer";
import { SEEDED_RUNS } from "@tracebench/fixtures";

function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

const report = await runSuite(GOLDEN_SET, SEEDED_RUNS);
const gate = releaseGate(report, GOLDEN_SET);

console.log("");
console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║           TRACEBENCH EVAL — RELEASE GATE                 ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log("");
console.log(`  Suite:     ${report.suiteName}`);
console.log(`  Scorer:    ${report.scorerSource ?? "unknown"}`);
console.log(`  Ran at:    ${report.ranAt}`);
console.log(`  Cases:     ${report.total}`);
console.log(`  Passed:    ${report.passed}`);
console.log(`  Failed:    ${report.failed}`);
console.log(`  Pass rate: ${(report.passRate * 100).toFixed(1)}%`);
console.log(`  Gate:      ${gate === "pass" ? "✅ PASS" : "❌ FAIL"}`);
console.log("");
console.log("  ID       RESULT   SCORE  FAILURES");
console.log("  -------- -------- ------ --------------------------------");

for (const r of report.results) {
  const c = GOLDEN_SET.find((x) => x.id === r.caseId);
  const expectFail = c?.tags.includes("expect-fail");
  const label = r.passed
    ? expectFail
      ? "PASS⚠"
      : "PASS"
    : expectFail
      ? "FAIL✓"
      : "FAIL";
  const failText = r.failures[0] ?? (expectFail && !r.passed ? "(expected)" : "");
  console.log(
    `  ${pad(r.caseId, 8)} ${pad(label, 8)} ${pad(r.score.toFixed(2), 6)} ${failText}`,
  );
}

console.log("");
const intentional = report.results.filter((r) => {
  const c = GOLDEN_SET.find((x) => x.id === r.caseId);
  return c?.tags.includes("expect-fail") && !r.passed;
}).length;
console.log(`  Intentional regressions (expect-fail): ${intentional}`);
console.log(`  Tip: EVAL_SCORER=rules · JEV_ADAPTER=live (needs AI Gateway OIDC)`);
console.log("");

if (gate === "fail") {
  process.exitCode = 1;
}
