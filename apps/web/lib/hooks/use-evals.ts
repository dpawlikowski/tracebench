"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEvals } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useEvals() {
  return useQuery({
    queryKey: queryKeys.evals,
    queryFn: fetchEvals,
  });
}
