"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState, Spinner, Stat } from "@tracebench/ui";
import { formatMs, formatUsd } from "@/lib/format";
import { WIDGET_META, type WidgetId } from "@/lib/dashboards/layout";

const Sparkline = dynamic(
  () => import("@/components/metrics/Sparkline").then((m) => m.Sparkline),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 rounded-sm border border-dashed border-tb-border bg-tb-bg/40" />
    ),
  },
);

const COLORS = ["#B4F03C", "#4ADE80", "#FBBF24", "#FF5C5C", "#A1A1AA", "#A1A1AA"];

export function WidgetShell({
  id,
  loading,
  empty,
  children,
}: {
  id: WidgetId;
  loading?: boolean;
  empty?: boolean;
  children: React.ReactNode;
}) {
  const meta = WIDGET_META[id];
  if (!meta) {
    return (
      <div
        className="flex h-full flex-col rounded-md border border-tb-border bg-tb-bg-elevated p-3"
        data-testid={`widget-${id}`}
      >
        <EmptyState title="Unknown widget" description={String(id)} className="py-4" />
      </div>
    );
  }
  return (
    <div
      className="flex h-full flex-col rounded-md border border-tb-border bg-tb-bg-elevated p-3"
      data-testid={`widget-${id}`}
    >
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-tb-text-dim">
        {meta.title}
      </div>
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Loading" />
        </div>
      ) : empty ? (
        <EmptyState title="No data" description={meta.description} className="py-4" />
      ) : (
        <div className="min-h-0 flex-1">{children}</div>
      )}
    </div>
  );
}

function KpiBody({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = <Stat label={label} value={value} hint={hint} />;
  if (!href) return body;
  return (
    <Link
      href={href}
      className="tb-interactive block cursor-pointer rounded-sm text-inherit no-underline outline-none ring-offset-2 ring-offset-tb-bg-elevated focus-visible:ring-2 focus-visible:ring-tb-accent"
      data-testid={`kpi-link-${label.replace(/\s+/g, "-").toLowerCase()}`}
      aria-label={`Open ${label}: ${value}`}
    >
      {body}
      <span className="mt-1 block text-[10px] text-tb-accent">Open →</span>
    </Link>
  );
}

export function KpiWidget({
  id,
  label,
  value,
  hint,
  loading,
  href,
}: {
  id: WidgetId;
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
  href?: string;
}) {
  return (
    <WidgetShell id={id} loading={loading}>
      <KpiBody label={label} value={value} hint={hint} href={href} />
    </WidgetShell>
  );
}

/** Cost / latency tiles with embedded mini uPlot sparkline. */
export function SparkKpiWidget({
  id,
  label,
  value,
  hint,
  series,
  color = "#B4F03C",
  loading,
  href,
}: {
  id: WidgetId;
  label: string;
  value: string;
  hint?: string;
  series: number[];
  color?: string;
  loading?: boolean;
  href?: string;
}) {
  return (
    <WidgetShell id={id} loading={loading}>
      <div className="flex h-full flex-col gap-2">
        <KpiBody label={label} value={value} hint={hint} href={href} />
        <div className="mt-auto min-h-[40px]">
          <Sparkline series={series} label="" color={color} height={40} />
        </div>
      </div>
    </WidgetShell>
  );
}

export function ToolMixWidget({
  data,
  loading,
}: {
  data: { name: string; count: number }[];
  loading?: boolean;
}) {
  return (
    <WidgetShell id="tool_mix" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#71717A", fontSize: 10 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={48}
          />
          <YAxis tick={{ fill: "#71717A", fontSize: 10 }} width={28} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#111113", border: "1px solid rgba(255,255,255,0.12)", fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#B4F03C" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetShell>
  );
}

export function DonutWidget({
  id,
  value,
  label,
  loading,
  href,
}: {
  id: WidgetId;
  value: number;
  label: string;
  loading?: boolean;
  href?: string;
}) {
  const pct = Math.round(value * 100);
  const data = [
    { name: label, value: pct },
    { name: "rest", value: Math.max(0, 100 - pct) },
  ];
  const stat = <Stat label={label} value={`${pct}%`} />;
  return (
    <WidgetShell id={id} loading={loading}>
      <div className="flex h-full items-center gap-3">
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={28} outerRadius={42} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? COLORS[1] : "rgba(255,255,255,0.06)"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {href ? (
          <Link
            href={href}
            className="tb-interactive cursor-pointer text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-tb-accent"
            aria-label={`Open ${label}: ${pct}%`}
            data-testid={`donut-link-${id}`}
          >
            {stat}
            <span className="mt-1 block text-[10px] text-tb-accent">Open →</span>
          </Link>
        ) : (
          stat
        )}
      </div>
    </WidgetShell>
  );
}

export { formatMs, formatUsd };
