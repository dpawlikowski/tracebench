"use client";

import {
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/prefs";

/** Desktop magnetic hover — max 8px pull. Press scale. Off on touch / reduced-motion. */
export function MagneticCta({
  children,
  className,
  strength = 6,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pull = useRef({ x: 0, y: 0 });

  const apply = useCallback(
    (press = false) => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        el.style.transform = press ? "scale(0.98)" : "scale(1)";
        return;
      }
      const { x, y } = pull.current;
      el.style.transform = press
        ? `translate(${x}px, ${y}px) scale(0.98)`
        : `translate(${x}px, ${y}px) scale(1)`;
    },
    [reduced],
  );

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const max = Math.min(8, strength);
      pull.current = {
        x: Math.max(-max, Math.min(max, (dx / r.width) * max * 2)),
        y: Math.max(-max, Math.min(max, (dy / r.height) * max * 2)),
      };
      apply(false);
    },
    [reduced, strength, apply],
  );

  const onLeave = useCallback(() => {
    pull.current = { x: 0, y: 0 };
    apply(false);
  }, [apply]);

  const style: CSSProperties = {
    transition: reduced
      ? "transform 80ms linear"
      : "transform 120ms cubic-bezier(0.16,1,0.3,1)",
    display: "inline-block",
    willChange: "transform",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseDown={() => apply(true)}
      onMouseUp={() => apply(false)}
      onTouchStart={() => apply(true)}
      onTouchEnd={() => apply(false)}
      data-testid="magnetic-cta"
    >
      {children}
    </div>
  );
}
