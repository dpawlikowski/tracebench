"use client";

import type { QueryClient } from "@tanstack/react-query";
import { fetchEvals, fetchRun } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function prefetchRun(client: QueryClient, id: string) {
  return client.prefetchQuery({
    queryKey: queryKeys.run(id),
    queryFn: () => fetchRun(id),
  });
}

export function prefetchEvals(client: QueryClient) {
  return client.prefetchQuery({
    queryKey: queryKeys.evals,
    queryFn: fetchEvals,
  });
}

/** Warm Next.js RSC payload for a route (hover/focus). */
export function prefetchRoute(href: string) {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  link.as = "document";
  // Avoid duplicates
  if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
  document.head.appendChild(link);
}
