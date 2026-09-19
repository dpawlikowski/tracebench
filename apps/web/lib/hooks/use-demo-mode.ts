"use client";

import { useQuery } from "@tanstack/react-query";

export type DemoModeInfo = {
  active: boolean;
  kind: "demo" | "hybrid" | "live";
  transport: string;
  jev: string;
  evalScorer: string;
};

async function fetchDemoMode(): Promise<DemoModeInfo> {
  const res = await fetch("/api/health", { cache: "no-store" });
  const data = (await res.json()) as {
    demoMode?: DemoModeInfo;
    checks?: {
      agentTransport?: { mode?: string };
      jev?: { mode?: string };
    };
  };
  if (data.demoMode) return data.demoMode;
  const transport = data.checks?.agentTransport?.mode ?? "fixture";
  const jev = data.checks?.jev?.mode ?? "mock";
  const active = transport === "fixture" && jev === "mock";
  return {
    active,
    kind: active ? "demo" : transport === "fixture" || jev === "mock" ? "hybrid" : "live",
    transport,
    jev,
    evalScorer: "mock-jev",
  };
}

export function useDemoMode() {
  return useQuery({
    queryKey: ["demo-mode"],
    queryFn: fetchDemoMode,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
