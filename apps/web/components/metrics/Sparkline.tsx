"use client";

import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useReducedMotion } from "@/lib/prefs";

/**
 * Lightweight uPlot sparkline. setData is rAF-throttled so SSE replay
 * doesn't thrash the canvas every frame.
 */
export function Sparkline({
  series,
  label,
  color = "#B4F03C",
  height = 48,
}: {
  series: number[];
  label: string;
  color?: string;
  height?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<uPlot.AlignedData | null>(null);
  const seriesKeyRef = useRef<string>("");
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || series.length < 2) return;

    const key = series.join(",");
    const xs = series.map((_, i) => i);
    const data: uPlot.AlignedData = [xs, series];

    if (plotRef.current) {
      if (seriesKeyRef.current === key) return;
      seriesKeyRef.current = key;
      pendingRef.current = data;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (plotRef.current && pendingRef.current) {
          plotRef.current.setData(pendingRef.current);
          pendingRef.current = null;
        }
      });
      return;
    }

    seriesKeyRef.current = key;
    const opts: uPlot.Options = {
      width: host.clientWidth || 240,
      height,
      legend: { show: false },
      cursor: { show: !reduced, x: false, y: false },
      scales: { x: { time: false }, y: { auto: true } },
      axes: [{ show: false }, { show: false }],
      series: [
        {},
        {
          stroke: color,
          width: 1.5,
          fill: `${color}22`,
          points: { show: false },
        },
      ],
      hooks: {},
    };

    plotRef.current = new uPlot(opts, data, host);

    let resizeRaf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (!plotRef.current || !host) return;
      if (resizeRaf != null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (!plotRef.current || !host) return;
        plotRef.current.setSize({ width: host.clientWidth, height });
      });
    });
    ro.observe(host);

    return () => {
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      plotRef.current?.destroy();
      plotRef.current = null;
      seriesKeyRef.current = "";
    };
  }, [series, color, height, reduced]);

  if (series.length < 2) {
    return (
      <div className="text-[11px] text-tb-text-dim" data-testid={`spark-${label}`}>
        {label}: awaiting samples
      </div>
    );
  }

  return (
    <div data-testid={`spark-${label || "tile"}`}>
      {label ? (
        <div className="mb-0.5 text-[11px] uppercase tracking-wider text-tb-text-dim">{label}</div>
      ) : null}
      <div ref={hostRef} className="w-full overflow-hidden" />
    </div>
  );
}
