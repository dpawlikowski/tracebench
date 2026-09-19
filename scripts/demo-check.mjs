#!/usr/bin/env node
/**
 * Demo Mode smoke — fixtures only, no external agents.
 * Expects `pnpm dev` (or NEXT already up) on :3000 unless BASE_URL set.
 */
const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function main() {
  const res = await fetch(`${base}/api/health`, { cache: "no-store" });
  const body = await res.json();
  const demo = body.demoMode;
  console.log("HTTP", res.status);
  console.log(JSON.stringify({ status: body.status, demoMode: demo }, null, 2));

  if (res.status !== 200) {
    console.error("FAIL: expected HTTP 200 in demo mode");
    process.exit(1);
  }
  if (!demo || demo.kind !== "demo") {
    console.error(
      "FAIL: expected demoMode.kind=demo (fixture + mock). Got:",
      demo,
    );
    process.exit(1);
  }
  if (body.checks?.agentTransport?.mode !== "fixture") {
    console.error("FAIL: agentTransport must be fixture");
    process.exit(1);
  }
  console.log("OK — Demo mode healthy (zero external agents)");
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  console.error("Hint: start the app with `pnpm dev` first.");
  process.exit(1);
});
