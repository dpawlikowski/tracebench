"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AuditEvent } from "@tracebench/schemas";
import { EmptyState, Panel } from "@tracebench/ui";
import { formatTime } from "@/lib/format";
import { fadeSlide } from "@/lib/motion";

export function AuditLog({ events }: { events: AuditEvent[] }) {
  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [events],
  );
  const reduceMotion = useReducedMotion();

  return (
    <Panel title="Audit log">
      <div data-testid="audit-log" className="flex flex-col" style={{ gap: "var(--tb-row-gap)" }}>
        {sorted.length === 0 ? (
          <EmptyState title="No audit events" description="Decisions will appear here." />
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((e) => {
              const anim = fadeSlide({ reduced: !!reduceMotion });
              return (
                <motion.div
                  key={e.id}
                  data-testid={`audit-event-${e.id}`}
                  data-audit-type={e.type}
                  {...anim}
                  className="border-l-2 border-tb-border-strong pl-2.5"
                >
                  <div className="mb-0.5 flex flex-wrap gap-2 font-mono text-[11px] text-tb-text-dim">
                    <span className="tabular-nums">{formatTime(e.timestamp)}</span>
                    <span>{e.type}</span>
                    <span>{e.actor}</span>
                  </div>
                  <div className="text-[13px]">{e.message}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </Panel>
  );
}
