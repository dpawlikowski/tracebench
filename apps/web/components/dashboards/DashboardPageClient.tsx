"use client";

import dynamic from "next/dynamic";

/** react-grid-layout WidthProvider is browser-only — never SSR the board. */
const DashboardBoard = dynamic(
  () => import("@/components/dashboards/DashboardBoard").then((m) => m.DashboardBoard),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto max-w-[1280px] space-y-3 px-5 py-16"
        data-testid="dashboard-loading"
      >
        <p className="text-[13px] text-tb-text-dim">Loading boards…</p>
      </div>
    ),
  },
);

export function DashboardPageClient() {
  return <DashboardBoard />;
}
