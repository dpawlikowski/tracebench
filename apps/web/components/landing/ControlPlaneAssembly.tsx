"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { cn } from "@tracebench/ui";
import { useReducedMotion } from "@/lib/prefs";

const PhosphorLattice = dynamic(
  () => import("./PhosphorLattice").then((m) => m.PhosphorLattice),
  { ssr: false },
);

type LayerId = "hitl" | "ops" | "pay" | "cfg" | "audit" | "eval";

const LAYER_COPY: Record<LayerId, { title: string; body: string }> = {
  hitl: {
    title: "HITL gate",
    body: "Risk-tiered pause for irreversible tools. Keyboard approve / deny, audit-backed.",
  },
  ops: {
    title: "OpsAgent",
    body: "Orchestrates the run timeline — thoughts, tools, and nested workers on one spine.",
  },
  pay: {
    title: "PayAgent",
    body: "Money-moving tools. High risk → escalate to HITL before execute_payment fires.",
  },
  cfg: {
    title: "CfgAgent",
    body: "Config / deploy writes. Medium–high risk; never silent in production paths.",
  },
  audit: {
    title: "Audit trail",
    body: "Immutable event log. Approvals, denials, and tool args stay reconstructable.",
  },
  eval: {
    title: "Eval release gate",
    body: "mock-jev scorecard before ship. Catch cost and behavior regressions pre-promote.",
  },
};

type Props = {
  className?: string;
  /** Drive assemble 0→1 from parent; omit = auto-assemble on mount */
  progress?: number;
  compact?: boolean;
  /** When true, layers are clickable with captions */
  interactive?: boolean;
};

/**
 * Control Plane Assembly — flat 2D instrument.
 * Resting state is always a clean composed plane; chaos only during brief intro.
 * Positions are % of stage so Story/Overview cards don't collide.
 */
export function ControlPlaneAssembly({
  className,
  progress,
  compact,
  interactive = true,
}: Props) {
  const reduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [a, setA] = useState(() => (reduced || progress !== undefined ? 1 : 0));
  const aMv = useMotionValue(reduced || progress !== undefined ? 1 : 0);
  const [selected, setSelected] = useState<LayerId | null>(null);
  const [replayKey, setReplayKey] = useState(0);

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
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        aMv.set(1);
        setA(1);
      },
    });
    return () => ctrl.stop();
  }, [progress, reduced, aMv, replayKey]);

  const replay = useCallback(() => {
    if (progress !== undefined) return;
    setSelected(null);
    if (reduced) {
      aMv.set(1);
      setA(1);
      return;
    }
    setReplayKey((k) => k + 1);
  }, [progress, reduced, aMv]);

  const select = useCallback(
    (id: LayerId) => {
      if (!interactive) return;
      setSelected((cur) => (cur === id ? null : id));
    },
    [interactive],
  );

  const chaos = 1 - a;
  const armed = a >= 0.72;
  const showLattice = !reduced && finePointer && !compact;

  /** Resting slots as % of stage — composed diamond around HITL, no overlap */
  const nodes = useMemo(
    () =>
      [
        { id: "ops" as const, label: "OpsAgent", left: "12%", top: "22%" },
        { id: "pay" as const, label: "PayAgent", left: "72%", top: "22%" },
        { id: "cfg" as const, label: "CfgAgent", left: "14%", top: "58%" },
        { id: "audit" as const, label: "Audit", left: "70%", top: "58%" },
      ] as const,
    [],
  );

  const layerBtn =
    "absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-1.5 text-[11px] transition-[border-color,background-color,box-shadow,opacity] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-tb-accent/40";

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-tb-border bg-tb-bg-sunken",
        compact ? "h-[220px]" : "aspect-[16/11] w-full min-h-[280px]",
        className,
      )}
      data-testid="control-plane-assembly"
      data-assemble={a.toFixed(2)}
      data-selected={selected ?? undefined}
    >
      <div className="tb-grid-atmosphere opacity-20" aria-hidden />
      {showLattice && <PhosphorLattice assemble={a} />}

      <div className="absolute inset-0 z-[1] px-3 pb-14 pt-4">
        {/* Deck plate */}
        <motion.div
          className="absolute left-1/2 top-[46%] h-[38%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-md border border-tb-border-strong bg-tb-bg-elevated/95"
          style={{ scale: 0.96 + a * 0.04, opacity: 0.55 + a * 0.45 }}
          aria-hidden
        />

        {/* Spine */}
        <motion.div
          className="absolute left-1/2 top-[42%] h-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${36 + a * 26}%`,
            backgroundColor: a > 0.55 ? "var(--tb-accent)" : "rgba(255,255,255,0.14)",
            opacity: 0.5 + a * 0.5,
          }}
          aria-hidden
        />

        {/* HITL center */}
        <motion.button
          type="button"
          disabled={!interactive}
          onClick={() => select("hitl")}
          aria-pressed={selected === "hitl"}
          aria-label="HITL gate — risk-tiered approval"
          data-testid="cpa-layer-hitl"
          className={cn(
            "absolute left-1/2 top-[40%] z-[3] flex min-w-[7.25rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md border px-3.5 py-2 text-[12px] tracking-tight shadow-[0_10px_28px_rgba(0,0,0,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-tb-accent/40",
            interactive && "cursor-pointer",
            !interactive && "pointer-events-none",
          )}
          style={{
            y: chaos * 18,
            rotate: -chaos * 6,
            scale: 0.97 + a * 0.03,
            borderColor:
              selected === "hitl"
                ? "rgba(180,240,60,0.85)"
                : armed
                  ? "rgba(180,240,60,0.48)"
                  : "rgba(255,255,255,0.12)",
            backgroundColor:
              selected === "hitl"
                ? "rgba(180,240,60,0.22)"
                : armed
                  ? "rgba(180,240,60,0.12)"
                  : "rgba(17,17,19,0.96)",
            color: armed || selected === "hitl" ? "var(--tb-accent)" : "#A1A1AA",
            boxShadow: selected === "hitl" ? "0 0 0 3px rgba(180,240,60,0.2)" : undefined,
          }}
        >
          <span className="text-[10px] font-medium text-tb-text-dim">HITL</span>
          <span className="font-semibold">{armed ? "Gate armed" : "Awaiting"}</span>
        </motion.button>

        {nodes.map((n, i) => {
          const sx = chaos * (i % 2 === 0 ? -28 : 28);
          const sy = chaos * (i < 2 ? -20 : 20);
          const isSel = selected === n.id;
          return (
            <motion.button
              key={n.id}
              type="button"
              disabled={!interactive}
              onClick={() => select(n.id)}
              aria-pressed={isSel}
              aria-label={`${LAYER_COPY[n.id].title} — ${LAYER_COPY[n.id].body}`}
              data-testid={`cpa-layer-${n.id}`}
              className={cn(
                layerBtn,
                "bg-tb-bg-elevated text-tb-text-muted",
                interactive ? "cursor-pointer" : "pointer-events-none",
              )}
              style={{
                left: n.left,
                top: n.top,
                x: sx,
                y: sy,
                rotate: chaos * (i % 2 === 0 ? -5 : 5),
                opacity: 0.55 + a * 0.45,
                borderColor: isSel
                  ? "rgba(180,240,60,0.7)"
                  : a > 0.6
                    ? "rgba(180,240,60,0.26)"
                    : "rgba(255,255,255,0.1)",
                boxShadow: isSel ? "0 0 0 3px rgba(180,240,60,0.18)" : undefined,
                color: isSel ? "var(--tb-text)" : undefined,
              }}
            >
              {n.label}
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          disabled={!interactive}
          onClick={() => select("eval")}
          aria-pressed={selected === "eval"}
          aria-label="Eval release gate"
          data-testid="cpa-layer-eval"
          className={cn(
            "absolute left-1/2 top-[72%] z-[2] -translate-x-1/2 -translate-y-1/2 rounded-md border bg-tb-bg px-2 py-1 text-[10px] text-tb-text-dim outline-none focus-visible:ring-2 focus-visible:ring-tb-accent/40",
            interactive ? "cursor-pointer" : "pointer-events-none",
          )}
          style={{
            y: chaos * 10,
            opacity: 0.5 + a * 0.5,
            borderColor:
              selected === "eval" ? "rgba(180,240,60,0.7)" : "rgba(255,255,255,0.1)",
            boxShadow:
              selected === "eval" ? "0 0 0 3px rgba(180,240,60,0.18)" : undefined,
            color: selected === "eval" ? "var(--tb-accent)" : undefined,
          }}
        >
          eval · mock-jev
        </motion.button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] border-t border-tb-border bg-tb-bg/92 px-3 py-2 backdrop-blur-[2px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {selected ? (
              <div data-testid="cpa-layer-caption">
                <div className="text-[11px] font-medium text-tb-accent">
                  {LAYER_COPY[selected].title}
                </div>
                <p className="m-0 mt-0.5 text-[11px] leading-snug text-tb-text-muted">
                  {LAYER_COPY[selected].body}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-[11px] text-tb-text-dim">
                <span>
                  {interactive
                    ? "Click a layer to inspect · control plane"
                    : "control plane"}
                </span>
                <span className="tabular-nums text-tb-accent">
                  {Math.round(a * 100)}% assembled
                </span>
              </div>
            )}
          </div>
          {interactive && progress === undefined && (
            <button
              type="button"
              onClick={replay}
              className="pointer-events-auto shrink-0 rounded border border-tb-border bg-tb-bg-elevated px-2 py-1 text-[10px] font-medium text-tb-text-muted hover:border-tb-border-strong hover:text-tb-text"
              data-testid="cpa-replay"
            >
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
