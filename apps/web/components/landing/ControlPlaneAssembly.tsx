"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { cn } from "@tracebench/ui";
import { useReducedMotion } from "@/lib/prefs";

const PhosphorLattice = dynamic(
  () => import("./PhosphorLattice").then((m) => m.PhosphorLattice),
  { ssr: false },
);

type Props = {
  className?: string;
  /** Drive assemble 0→1 from scroll parent; omit = auto on mount */
  progress?: number;
  compact?: boolean;
};

/**
 * Control Plane Assembly — flat 2D instrument.
 * Assemble via motion `animate(motionValue, 1)` (not React timers/rAF).
 * No CSS preserve-3d / perspective — Win Chrome was freezing HITL while canvas moved.
 * HITL travel stays inside the overflow frame; progress always lands on 100%.
 */
export function ControlPlaneAssembly({ className, progress, compact }: Props) {
  const reduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [a, setA] = useState(() => (reduced || progress !== undefined ? 1 : 0));
  const aMv = useMotionValue(reduced || progress !== undefined ? 1 : 0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useMotionValueEvent(aMv, "change", (v) => {
    setA(v >= 0.995 ? 1 : v);
  });

  useEffect(() => {
    if (progress !== undefined) {
      const v = Math.min(1, Math.max(0, progress));
      aMv.set(v);
      setA(v);
      return;
    }
    if (reduced) {
      aMv.set(1);
      setA(1);
      return;
    }
    aMv.set(0);
    setA(0);
    const ctrl = animate(aMv, 1, {
      duration: 1.45,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        aMv.set(1);
        setA(1);
      },
    });
    return () => ctrl.stop();
  }, [progress, reduced, aMv]);

  const chaos = 1 - a;
  const armed = a >= 0.72;
  const showLattice = !reduced && finePointer && !compact;

  const nodes = useMemo(
    () => [
      { id: "ops", label: "OpsAgent", x: -108, y: -42 },
      { id: "pay", label: "PayAgent", x: 100, y: -34 },
      { id: "cfg", label: "CfgAgent", x: -86, y: 48 },
      { id: "audit", label: "Audit", x: 92, y: 44 },
    ],
    [],
  );

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-tb-border bg-tb-bg-sunken",
        compact ? "h-[220px]" : "h-[min(400px,50vw)] min-h-[300px]",
        className,
      )}
      data-testid="control-plane-assembly"
      data-assemble={a.toFixed(2)}
      aria-hidden
    >
      <div className="tb-grid-atmosphere opacity-20" />
      {showLattice && <PhosphorLattice assemble={a} />}

      <div className="absolute inset-0 z-[1] flex items-center justify-center px-4 pb-10 pt-6">
        <motion.div
          className="absolute h-[42%] w-[66%] rounded-md border border-tb-border-strong bg-tb-bg-elevated/95"
          style={{ y: 22, scale: 0.95 + a * 0.05, opacity: 0.55 + a * 0.45 }}
        />

        <motion.div
          className="absolute h-[2px] rounded-full"
          style={{
            width: `${40 + a * 28}%`,
            y: -4,
            backgroundColor: a > 0.55 ? "var(--tb-accent)" : "rgba(255,255,255,0.14)",
            opacity: 0.5 + a * 0.5,
          }}
        />

        <motion.div
          className="absolute z-[3] flex min-w-[7.25rem] flex-col items-center gap-0.5 rounded-md border px-3.5 py-2 text-[12px] tracking-tight shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
          style={{
            y: -22 + chaos * 28,
            rotate: -chaos * 10,
            scale: 0.96 + a * 0.04,
            borderColor: armed ? "rgba(180,240,60,0.48)" : "rgba(255,255,255,0.12)",
            backgroundColor: armed ? "rgba(180,240,60,0.12)" : "rgba(17,17,19,0.96)",
            color: armed ? "var(--tb-accent)" : "#A1A1AA",
          }}
        >
          <span className="text-[10px] font-medium text-tb-text-dim">HITL</span>
          <span className="font-semibold">{armed ? "Gate armed" : "Awaiting"}</span>
        </motion.div>

        {nodes.map((n, i) => {
          const sx = chaos * (i % 2 === 0 ? -48 : 52) * (1 + i * 0.04);
          const sy = chaos * (i < 2 ? -32 : 34);
          return (
            <motion.div
              key={n.id}
              className="absolute z-[2] rounded-md border bg-tb-bg-elevated px-2.5 py-1.5 text-[11px] text-tb-text-muted"
              style={{
                x: n.x + sx,
                y: n.y + sy,
                rotate: chaos * (i % 2 === 0 ? -8 : 9),
                opacity: 0.4 + a * 0.6,
                borderColor: a > 0.6 ? "rgba(180,240,60,0.26)" : "rgba(255,255,255,0.1)",
              }}
            >
              {n.label}
            </motion.div>
          );
        })}

        <motion.div
          className="absolute z-[2] rounded-md border border-tb-border bg-tb-bg px-2 py-1 text-[10px] text-tb-text-dim"
          style={{ x: 28, y: 86 - a * 8, opacity: 0.45 + a * 0.55 }}
        >
          eval · mock-jev
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] border-t border-tb-border bg-tb-bg/92 px-3 py-2 backdrop-blur-[2px]">
        <div className="flex items-center justify-between gap-2 text-[11px] text-tb-text-dim">
          <span>control plane</span>
          <span className="tabular-nums text-tb-accent">{Math.round(a * 100)}% assembled</span>
        </div>
      </div>
    </div>
  );
}
