"use client";

import dynamic from "next/dynamic";

/** react-grid-layout WidthProvider is browser-only — never SSR the board. */
const DashboardBoard = dynamic(
  () => import("@/components/dashboards/DashboardBoard").then((m) => m.DashboardBoard),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto max-w-[1280px] px-5 py-16 text-tb-text-muted"
        data-testid="dashboard-loading"
      >
        Loading boards…
      </div>
    ),
  },
);

export function DashboardPageClient() {
  return <DashboardBoard />;
}
