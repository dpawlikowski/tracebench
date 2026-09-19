"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentRun, TimelineEvent } from "@tracebench/schemas";
import { useReducedMotion } from "@/lib/prefs";

type Kind = TimelineEvent["kind"];

const KIND_COLOR: Record<Kind, string> = {
  thought: "#5c6b82",
  tool: "#5b9fd4",
  approval: "#d4a017",
  outcome: "#3dba7e",
  agent_spawn: "#7c9cff",
  agent_message: "#3dba7e",
  agent_await: "#d4a017",
  agent_join: "#5b9fd4",
};

/**
 * Langfuse-style shape-of-run strip: Canvas 2D zoom/pan overview of the timeline.
 * NOT WebGL. Drag to pan, wheel to zoom, click to scrub.
 * Playhead tracks the latest visible event during replay (rAF-throttled draw).
 */
export function ShapeOfRun({
  run,
  visibleEventIds,
  onSelectEvent,
}: {
  run: AgentRun;
  visibleEventIds: Set<string>;
  onSelectEvent?: (eventId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const drag = useRef<{ x: number; pan: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const dirtyRef = useRef(true);

  const points = useMemo(() => {
    if (run.timeline.length === 0) return [];
    const t0 = new Date(run.timeline[0]!.at).getTime();
    const t1 = new Date(run.timeline[run.timeline.length - 1]!.at).getTime();
    const span = Math.max(1, t1 - t0);
    return run.timeline.map((e, i) => {
      const t = new Date(e.at).getTime();
      return {
        id: e.id,
        kind: e.kind,
        x: (t - t0) / span,
        i,
        visible: visibleEventIds.has(e.id),
      };
    });
  }, [run.timeline, visibleEventIds]);

  const playheadX = useMemo(() => {
    let last = -1;
    for (const p of points) {
      if (p.visible) last = p.x;
    }
    return last;
  }, [points]);

  const drawNow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0) return;
    const nextW = Math.floor(cssW * dpr);
    const nextH = Math.floor(cssH * dpr);
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.fillStyle = "#1a2330";
    ctx.fillRect(0, cssH / 2 - 1, cssW, 2);

    const viewSpan = 1 / zoom;
    const start = Math.max(0, Math.min(1 - viewSpan, pan));

    for (const p of points) {
      const nx = (p.x - start) / viewSpan;
      if (nx < -0.05 || nx > 1.05) continue;
      const x = nx * cssW;
      const y = cssH / 2;
      const r = p.visible ? 4.5 : 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = KIND_COLOR[p.kind];
      ctx.globalAlpha = p.visible ? 1 : 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (p.visible) {
        ctx.strokeStyle = "rgba(232,238,247,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Playhead — latest visible event
    if (playheadX >= 0) {
      const nx = (playheadX - start) / viewSpan;
      if (nx >= 0 && nx <= 1) {
        const x = nx * cssW;
        ctx.strokeStyle = "rgba(232,238,247,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 2);
        ctx.lineTo(x + 0.5, cssH - 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "rgba(91,159,212,0.35)";
    ctx.strokeRect(0.5, 0.5, cssW - 1, cssH - 1);
  }, [points, zoom, pan, playheadX]);

  const scheduleDraw = useCallback(() => {
    dirtyRef.current = true;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      drawNow();
    });
  }, [drawNow]);

  useEffect(() => {
    scheduleDraw();
    const onResize = () => scheduleDraw();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleDraw]);

  function clientToNorm(clientX: number): number {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const viewSpan = 1 / zoom;
    const start = Math.max(0, Math.min(1 - viewSpan, pan));
    const nx = (clientX - rect.left) / rect.width;
    return start + nx * viewSpan;
  }

  function nearest(normX: number) {
    let best = points[0];
    let bestD = Infinity;
    for (const p of points) {
      const d = Math.abs(p.x - normX);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  return (
    <div className="mb-3" data-testid="shape-of-run">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-tb-text-dim">
          Shape of run
        </span>
        <span className="font-mono text-[11px] text-tb-text-dim tabular-nums">
          {zoom.toFixed(1)}× · drag pan · wheel zoom
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-10 w-full cursor-ew-resize rounded-sm border border-tb-border bg-tb-bg touch-none"
        role="img"
        aria-label="Timeline shape overview. Drag to pan, scroll to zoom, click to select."
        onWheel={(e) => {
          if (reduced) return;
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setZoom((z) => Math.min(8, Math.max(1, z * delta)));
        }}
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, pan };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const dx = e.clientX - drag.current.x;
          const viewSpan = 1 / zoom;
          const deltaPan = -(dx / canvas.clientWidth) * viewSpan;
          setPan(Math.max(0, Math.min(1 - viewSpan, drag.current.pan + deltaPan)));
        }}
        onPointerUp={(e) => {
          const started = drag.current;
          drag.current = null;
          if (!started || !onSelectEvent) return;
          if (Math.abs(e.clientX - started.x) > 4) return;
          const hit = nearest(clientToNorm(e.clientX));
          if (hit) onSelectEvent(hit.id);
        }}
      />
    </div>
  );
}
