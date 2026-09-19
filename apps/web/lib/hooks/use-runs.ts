"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRuns } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useRuns() {
  return useQuery({
    queryKey: queryKeys.runs,
    queryFn: fetchRuns,
  });
}
