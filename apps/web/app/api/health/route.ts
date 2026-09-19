import { NextRequest, NextResponse } from "next/server";
import { SEEDED_RUNS } from "@tracebench/fixtures";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckResult = {
  ok: boolean;
  detail?: string;
  mode?: string;
  count?: number;
  optional?: boolean;
};

type HealthBody = {
  status: "ok" | "degraded" | "down";
  demoMode: {
    active: boolean;
    kind: "demo" | "hybrid" | "live";
    transport: string;
    jev: string;
    evalScorer: string;
  };
  checks: {
    web: CheckResult;
    fixtures: CheckResult;
    evalGate?: CheckResult;
    agentTransport: CheckResult;
    jev: CheckResult;
    cloudflare?: CheckResult;
  };
  version?: string;
  commit?: string;
  ts: string;
};

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
} as const;

async function probeCloudflare(url: string): Promise<CheckResult> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${url.replace(/\/$/, "")}/health`, {
      signal: controller.signal,
      cache: "no-store",
    }).catch(async () =>
      fetch(url, { signal: controller.signal, cache: "no-store" }),
    );
    clearTimeout(t);
    if (!res.ok) {
      return {
        ok: false,
        optional: true,
        detail: `HTTP ${res.status}`,
        mode: "cloudflare",
      };
    }
    return { ok: true, optional: true, mode: "cloudflare", detail: "reachable" };
  } catch (e) {
    return {
      ok: false,
      optional: true,
      mode: "cloudflare",
      detail: e instanceof Error ? e.message : "probe failed",
    };
  }
}

/**
 * Readiness endpoint — returns 503 when a *critical* check fails.
 * Optional checks (e.g. Cloudflare probe) only degrade status, never force down
 * when AGENT_TRANSPORT=fixture (local default).
 *
 * Force failure for drills:
 *   HEALTH_FORCE_DOWN=1 pnpm dev
 *   curl 'http://127.0.0.1:3000/api/health?force=down'
 */
export async function GET(req: NextRequest) {
  const forceDown =
    process.env.HEALTH_FORCE_DOWN === "1" ||
    req.nextUrl.searchParams.get("force") === "down";

  const transportMode = (process.env.AGENT_TRANSPORT ?? "fixture").toLowerCase();
  const jevMode = (process.env.JEV_ADAPTER ?? "mock").toLowerCase();
  const cfUrl = process.env.CF_AGENT_URL;

  const fixturesOk = Array.isArray(SEEDED_RUNS) && SEEDED_RUNS.length > 0;

  let evalGate: CheckResult | undefined;
  if (req.nextUrl.searchParams.get("evalSmoke") === "1") {
    try {
      const { GOLDEN_SET, runSuite, releaseGate } = await import("@tracebench/evals");
      const report = await runSuite(GOLDEN_SET.slice(0, 3), SEEDED_RUNS);
      const gate = releaseGate(report, GOLDEN_SET.slice(0, 3));
      evalGate = {
        ok: true,
        detail: `smoke gate=${gate} cases=${report.total}`,
      };
    } catch (e) {
      evalGate = {
        ok: false,
        detail: e instanceof Error ? e.message : "eval smoke failed",
      };
    }
  }

  let cloudflare: CheckResult | undefined;
  if (transportMode === "cloudflare" && cfUrl) {
    cloudflare = await probeCloudflare(cfUrl);
  } else if (cfUrl && req.nextUrl.searchParams.get("probeCf") === "1") {
    // Optional probe when fixture default is active — never critical
    cloudflare = await probeCloudflare(cfUrl);
  }

  const checks: HealthBody["checks"] = {
    web: { ok: !forceDown, detail: forceDown ? "HEALTH_FORCE_DOWN" : "up" },
    fixtures: {
      ok: fixturesOk,
      count: SEEDED_RUNS.length,
      detail: fixturesOk ? "seeded runs loaded" : "fixtures empty",
    },
    agentTransport: {
      ok: transportMode === "fixture" || transportMode === "cloudflare",
      mode: transportMode,
    },
    jev: {
      ok: jevMode === "mock" || jevMode === "live",
      mode: jevMode,
    },
  };

  if (evalGate) checks.evalGate = evalGate;
  if (cloudflare) checks.cloudflare = cloudflare;

  const criticalFailed =
    forceDown ||
    !checks.web.ok ||
    !checks.fixtures.ok ||
    !checks.agentTransport.ok ||
    (transportMode === "cloudflare" && cloudflare && !cloudflare.ok) ||
    (evalGate && !evalGate.ok);

  const optionalFailed =
    (cloudflare && cloudflare.optional && !cloudflare.ok) ||
    !checks.jev.ok;

  const status: HealthBody["status"] = criticalFailed
    ? "down"
    : optionalFailed
      ? "degraded"
      : "ok";

  const evalScorer = (process.env.EVAL_SCORER ?? "mock-jev").toLowerCase();
  const isFixture = transportMode === "fixture";
  const isMockJev = jevMode === "mock";
  const demoActive = isFixture && isMockJev;
  const demoKind: HealthBody["demoMode"]["kind"] = demoActive
    ? "demo"
    : isFixture || isMockJev
      ? "hybrid"
      : "live";

  const body: HealthBody = {
    status,
    demoMode: {
      active: demoActive,
      kind: demoKind,
      transport: transportMode,
      jev: jevMode,
      evalScorer,
    },
    checks,
    version: process.env.npm_package_version ?? "0.1.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT,
    ts: new Date().toISOString(),
  };

  const httpStatus = criticalFailed ? 503 : 200;
  return NextResponse.json(body, { status: httpStatus, headers: NO_STORE });
}
