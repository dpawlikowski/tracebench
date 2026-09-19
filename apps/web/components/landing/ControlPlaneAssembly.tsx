"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
 * Control Plane Assembly — CSS 3D instrument (timeline spine + HITL gate + agent nodes).
 * Optional Canvas 2D phosphor lattice (desktop / fine pointer / no reduced-motion).
 * No Three.js.
 */
export function ControlPlaneAssembly({ className, progress, compact }: Props) {
  const reduced = useReducedMotion();
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
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const e = 1 - Math.pow(1 - t, 3);
      setAuto(e);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setAuto(1);
    };
    raf = requestAnimationFrame(tick);
    // Hard guarantee: some Windows/Chrome modes throttle rAF hard and leave us mid-tween
    const fallback = window.setTimeout(() => {
      if (!cancelled) setAuto(1);
    }, dur + 80);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [progress, reduced]);

  const a = progress !== undefined ? Math.min(1, Math.max(0, progress)) : auto;

  // CSS transforms interpolate with assemble progress
  const rotX = reduced ? -18 : -28 + a * 10;
  const rotY = reduced ? 12 : 22 - a * 14;
  const chaos = 1 - a;

  const nodes = useMemo(
    () => [
      { id: "ops", label: "OpsAgent", x: -38, y: -28, z: 40 },
      { id: "pay", label: "PayAgent", x: 42, y: -18, z: 28 },
      { id: "cfg", label: "CfgAgent", x: -20, y: 36, z: 52 },
      { id: "audit", label: "Audit", x: 36, y: 32, z: 18 },
    ],
    [],
  );

  const showLattice = !reduced && finePointer && !compact;

  return (
    <div
      className={cn(
        "tb-cpa-stage relative isolate overflow-hidden rounded-md border border-tb-border bg-tb-bg-sunken",
        compact ? "h-[220px]" : "h-[min(420px,52vw)] min-h-[280px]",
        className,
      )}
      data-testid="control-plane-assembly"
      aria-hidden
    >
      <div className="tb-grid-atmosphere opacity-60" />
      {showLattice && <PhosphorLattice assemble={a} />}

      <div
        className="tb-cpa-scene absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: reduced ? undefined : "transform 160ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Deck / plane */}
        <div
          className="tb-cpa-layer absolute h-[58%] w-[72%] rounded-sm border border-tb-border-strong bg-tb-bg-elevated/90"
          style={{
            transform: `translateZ(${12 + a * 8}px) rotateX(78deg)`,
            boxShadow: "inset 0 0 0 1px rgba(184,255,61,0.06)",
          }}
        />

        {/* Timeline spine */}
        <div
          className="tb-cpa-layer absolute h-[3px] w-[62%] origin-left rounded-full bg-tb-border-strong"
          style={{
            transform: `translateZ(${40 + a * 20}px) translateY(-8px) scaleX(${0.35 + a * 0.65})`,
            background:
              a > 0.55
                ? "linear-gradient(90deg, rgba(184,255,61,0.15), #B8FF3D, rgba(184,255,61,0.2))"
                : undefined,
          }}
        >
          {[0.15, 0.38, 0.62, 0.85].map((p, i) => (
            <span
              key={i}
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-tb-border-strong bg-tb-bg-hover"
              style={{
                left: `${p * 100}%`,
                background: a > 0.4 + i * 0.1 ? "#B8FF3D" : undefined,
                transform: `translate(-50%, -50%) translateY(${chaos * (i % 2 === 0 ? -14 : 18)}px)`,
                opacity: 0.5 + a * 0.5,
              }}
            />
          ))}
        </div>

        {/* HITL gate */}
        <div
          className="tb-cpa-layer absolute flex flex-col items-center gap-1 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em]"
          style={{
            transform: `translateZ(${70 + a * 36}px) translateY(${-48 + chaos * 40}px) rotateX(${-chaos * 25}deg)`,
            borderColor: a > 0.65 ? "rgba(184,255,61,0.55)" : "rgba(255,255,255,0.12)",
            background:
              a > 0.65 ? "rgba(184,255,61,0.12)" : "rgba(14,14,16,0.92)",
            color: a > 0.65 ? "#B8FF3D" : "#A1A1AA",
            boxShadow: a > 0.75 ? "0 0 24px rgba(184,255,61,0.18)" : undefined,
          }}
        >
          <span className="text-[9px] text-tb-text-dim">HITL</span>
          <span className="font-semibold">{a > 0.7 ? "Gate armed" : "Awaiting"}</span>
        </div>

        {/* Agent nodes */}
        {nodes.map((n, i) => {
          const scatterX = chaos * (i % 2 === 0 ? -50 : 55) * (1 + i * 0.1);
          const scatterY = chaos * (i < 2 ? -40 : 48);
          const scatterZ = chaos * 80;
          return (
            <div
              key={n.id}
              className="tb-cpa-layer absolute rounded-sm border border-tb-border bg-tb-bg-elevated px-2.5 py-1.5 font-mono text-[10px] text-tb-text-muted"
              style={{
                transform: `translate3d(${n.x + scatterX}%, ${n.y + scatterY}%, ${n.z - scatterZ}px)`,
                opacity: 0.35 + a * 0.65,
                borderColor:
                  a > 0.6 ? "rgba(184,255,61,0.28)" : "rgba(255,255,255,0.08)",
              }}
            >
              {n.label}
            </div>
          );
        })}

        {/* Eval chip */}
        <div
          className="tb-cpa-layer absolute rounded-sm border border-tb-border bg-tb-bg px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-tb-text-dim"
          style={{
            transform: `translate3d(8%, 52%, ${24 + a * 30}px)`,
            opacity: 0.4 + a * 0.6,
          }}
        >
          eval · mock-jev
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] border-t border-tb-border bg-tb-bg/80 px-3 py-2 backdrop-blur-[2px]">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-tb-text-dim">
          <span>control plane</span>
          <span className="tabular-nums text-tb-accent">
            {Math.round(a * 100)}% assembled
          </span>
        </div>
      </div>
    </div>
  );
}
