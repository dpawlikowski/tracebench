"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgentRun } from "@tracebench/schemas";
import { fetchRun } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useRun(id: string, initialData?: AgentRun) {
  return useQuery({
    queryKey: queryKeys.run(id),
    queryFn: () => fetchRun(id),
    initialData,
  });
}
