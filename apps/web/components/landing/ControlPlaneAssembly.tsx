"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion as useMotionReduced } from "motion/react";
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
 * Control Plane Assembly — instrument assemble (HITL gate + agent nodes + spine).
 * Uses motion/react for layer motion (CSS 3D inline transforms fail to repaint on
 * some Windows Chrome profiles while canvas particles still animate).
 */
export function ControlPlaneAssembly({ className, progress, compact }: Props) {
  const reducedPref = useReducedMotion();
  const reducedMotionLib = useMotionReduced();
  const reduced = reducedPref || !!reducedMotionLib;
  const [auto, setAuto] = useState(reduced ? 1 : 0);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (progress !== undefined) return;
    if (reduced) {
      setAuto(1);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const n = 10;
    const dur = 1400;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const eased = 1 - Math.pow(1 - t, 3);
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setAuto(eased);
        }, Math.round(t * dur)),
      );
    }
    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [progress, reduced]);

  const a = progress !== undefined ? Math.min(1, Math.max(0, progress)) : auto;
  const chaos = 1 - a;
  const tween = reduced
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  const nodes = useMemo(
    () => [
      { id: "ops", label: "OpsAgent", x: -120, y: -72 },
      { id: "pay", label: "PayAgent", x: 110, y: -56 },
      { id: "cfg", label: "CfgAgent", x: -88, y: 78 },
      { id: "audit", label: "Audit", x: 96, y: 70 },
    ],
    [],
  );

  const showLattice = !reduced && finePointer && !compact;
  const armed = a > 0.7;

  return (
    <div
      className={cn(
        "tb-cpa-stage relative isolate overflow-hidden rounded-lg border border-tb-border bg-tb-bg-sunken",
        compact ? "h-[220px]" : "h-[min(420px,52vw)] min-h-[280px]",
        className,
      )}
      data-testid="control-plane-assembly"
      aria-hidden
    >
      <div className="tb-grid-atmosphere opacity-30" />
      {showLattice && <PhosphorLattice assemble={a} />}

      <motion.div
        className="tb-cpa-scene absolute inset-0 flex items-center justify-center"
        animate={{ rotateX: reduced ? -12 : -22 + a * 10, rotateY: reduced ? 8 : 16 - a * 12 }}
        transition={tween}
        style={{ transformStyle: "preserve-3d", perspective: 900 }}
      >
        {/* Deck */}
        <motion.div
          className="absolute h-[52%] w-[68%] rounded-md border border-tb-border-strong bg-tb-bg-elevated/95"
          animate={{
            rotateX: 72,
            y: 18,
            scale: 0.92 + a * 0.08,
            opacity: 0.55 + a * 0.45,
          }}
          transition={tween}
          style={{ transformStyle: "preserve-3d" }}
        />

        {/* Timeline spine */}
        <motion.div
          className="absolute h-[3px] origin-center rounded-full"
          animate={{
            width: `${42 + a * 28}%`,
            y: -12,
            backgroundColor: a > 0.55 ? "#B4F03C" : "rgba(255,255,255,0.18)",
            opacity: 0.5 + a * 0.5,
          }}
          transition={tween}
        />

        {/* HITL gate — big visible settle */}
        <motion.div
          className="absolute z-[2] flex flex-col items-center gap-0.5 rounded-md border px-3.5 py-2.5 text-[12px] tracking-tight"
          animate={{
            y: -56 + chaos * 64,
            rotate: -chaos * 18,
            scale: 0.92 + a * 0.08,
            borderColor: armed ? "rgba(180,240,60,0.45)" : "rgba(255,255,255,0.14)",
            backgroundColor: armed ? "rgba(180,240,60,0.14)" : "rgba(17,17,19,0.94)",
            color: armed ? "#B4F03C" : "#A1A1AA",
          }}
          transition={tween}
        >
          <span className="text-[10px] font-medium text-tb-text-dim">HITL</span>
          <span className="font-semibold">{armed ? "Gate armed" : "Awaiting"}</span>
        </motion.div>

        {/* Agent nodes — scatter → dock */}
        {nodes.map((n, i) => {
          const scatterX = chaos * (i % 2 === 0 ? -70 : 78) * (1 + i * 0.08);
          const scatterY = chaos * (i < 2 ? -58 : 62);
          return (
            <motion.div
              key={n.id}
              className="absolute rounded-md border bg-tb-bg-elevated px-2.5 py-1.5 text-[11px] text-tb-text-muted"
              animate={{
                x: n.x + scatterX,
                y: n.y + scatterY,
                opacity: 0.4 + a * 0.6,
                borderColor: a > 0.6 ? "rgba(180,240,60,0.28)" : "rgba(255,255,255,0.1)",
                rotate: chaos * (i % 2 === 0 ? -12 : 14),
              }}
              transition={tween}
            >
              {n.label}
            </motion.div>
          );
        })}

        {/* Eval chip */}
        <motion.div
          className="absolute rounded-md border border-tb-border bg-tb-bg px-2 py-1 text-[10px] tracking-tight text-tb-text-dim"
          animate={{
            x: 28,
            y: 96 - a * 12,
            opacity: 0.45 + a * 0.55,
          }}
          transition={tween}
        >
          eval · mock-jev
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] border-t border-tb-border bg-tb-bg/90 px-3 py-2 backdrop-blur-[2px]">
        <div className="flex items-center justify-between gap-2 text-[11px] text-tb-text-dim">
          <span>control plane</span>
          <span className="tabular-nums text-tb-accent">{Math.round(a * 100)}% assembled</span>
        </div>
      </div>
    </div>
  );
}
