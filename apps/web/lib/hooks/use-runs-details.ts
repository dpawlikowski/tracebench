"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { AgentRun } from "@tracebench/schemas";
import { fetchRun } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Fetch full AgentRun details for a list of ids via useQueries.
 * Fingerprints query results so consumers can safely memoize without
 * depending on the fresh array useQueries returns every render.
 */
export function useRunsDetails(
  ids: string[],
  options?: { staleTime?: number },
): { runs: AgentRun[]; isLoading: boolean; isError: boolean } {
  const staleTime = options?.staleTime ?? 30_000;

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.run(id),
      queryFn: () => fetchRun(id),
      staleTime,
      enabled: Boolean(id),
    })),
  });

  // useQueries returns a new array every render — key off stable data signals only.
  const fingerprint = queries
    .map((q) => `${q.status}:${q.dataUpdatedAt}:${q.data?.id ?? ""}`)
    .join("|");

  const runs = useMemo(() => {
    return queries.map((q) => q.data).filter(Boolean) as AgentRun[];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fingerprint is the identity
  }, [fingerprint]);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  return { runs, isLoading, isError };
}
