"use client";

import type { AgentRun } from "@tracebench/schemas";
import { useRunsDetails } from "@/lib/hooks/use-runs-details";

/**
 * Load child AgentRuns for a parent run. Returns unwrapped AgentRun[]
 * so UI stays dumb (no useQueries / query result unwrapping in views).
 */
export function useChildRuns(
  parent: AgentRun,
  options?: { staleTime?: number },
): { children: AgentRun[]; isLoading: boolean; isError: boolean } {
  const { runs, isLoading, isError } = useRunsDetails(parent.childRunIds ?? [], {
    staleTime: options?.staleTime ?? 60_000,
  });
  return { children: runs, isLoading, isError };
}
