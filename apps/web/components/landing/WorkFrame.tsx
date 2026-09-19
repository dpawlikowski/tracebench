"use client";

import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Badge, cn } from "@tracebench/ui";
import { useReducedMotion } from "@/lib/prefs";

type Phase = "chaos" | "governed";

/** Light pointer tilt + clickable before/after scrub of ungoverned → HITL. */
export function WorkFrame({
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<Phase>("chaos");

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: py * -4, y: px * 5 });
      // Soft scrub by pointer X when motion is allowed
      const next: Phase = px < 0 ? "chaos" : "governed";
      setPhase(next);
    },
    [reduced],
  );

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const toggle = useCallback(() => {
    setPhase((p) => (p === "chaos" ? "governed" : "chaos"));
  }, []);

  const governed = phase === "governed";

  return (
    <div className={className} style={reduced ? undefined : { perspective: 900 }}>
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={governed}
        data-testid="work-frame"
        data-phase={phase}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className={cn(
          "cursor-pointer overflow-hidden rounded-md border border-tb-border bg-tb-bg-elevated outline-none transition-[transform,border-color] duration-150 ease-out",
          "hover:border-tb-border-strong focus-visible:border-tb-accent/50",
        )}
        style={{
          transform: reduced
            ? undefined
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        }}
      >
        <div className="flex items-center justify-between border-b border-tb-border bg-tb-bg px-4 py-2.5">
          <span className="font-mono text-[11px] text-tb-text-dim">
            {governed
              ? "run_live_approve · awaiting_approval · wire_transfer"
              : "agent_chat · ungoverned · wire_transfer"}
          </span>
          <span className="text-[10px] font-medium tracking-tight text-tb-text-dim">
            {governed ? "After · HITL" : "Before · chaos"} · click to toggle
          </span>
        </div>
        <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2 border-b border-tb-border p-4 md:border-b-0 md:border-r">
            {(governed
              ? [
                  { t: "thought", c: "Verify beneficiary + amount against policy", tone: "neutral" as const },
                  { t: "tool", c: "wire_transfer · $12,400 · high risk", tone: "accent" as const },
                  { t: "approval", c: "HITL gate · Jev escalated", tone: "warning" as const },
                ]
              : [
                  { t: "prompt", c: "Just send the wire — trust me", tone: "neutral" as const },
                  { t: "tool", c: "wire_transfer · $12,400 · no risk tier", tone: "danger" as const },
                  { t: "result", c: "Executed. No human. No audit row.", tone: "danger" as const },
                ]
            ).map((row) => (
              <div
                key={row.t + row.c}
                className="flex items-start gap-3 rounded-md border border-tb-border bg-tb-bg-sunken px-3 py-2"
              >
                <Badge tone={row.tone}>{row.t}</Badge>
                <span className="font-mono text-[12px] text-tb-text-muted">{row.c}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 p-4">
            <div className="text-[12px] font-medium tracking-tight text-tb-text-dim">
              {governed ? "Cost / latency" : "Blind burn"}
            </div>
            <div
              className={cn(
                "font-mono text-[28px] font-semibold tracking-tight tabular-nums transition-colors",
                governed ? "text-tb-text" : "text-tb-danger",
              )}
            >
              {governed ? "$0.22" : "???"}
            </div>
            <div
              className={cn(
                "h-10 rounded-md border border-dashed transition-colors",
                governed
                  ? "border-tb-border bg-tb-accent-soft/50"
                  : "border-tb-danger/40 bg-tb-danger-soft/30",
              )}
            />
            <div className="text-[12px] text-tb-text-muted">
              {governed
                ? "Instrument chrome — dense ops, calm decisions."
                : "No burn rail. Finance learns from the card statement."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
