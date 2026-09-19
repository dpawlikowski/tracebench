"use client";

import {
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/prefs";

/** Desktop magnetic hover — max 8px pull. Off on touch / reduced-motion. */
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
      const nx = Math.max(-max, Math.min(max, (dx / r.width) * max * 2));
      const ny = Math.max(-max, Math.min(max, (dy / r.height) * max * 2));
      el.style.transform = `translate(${nx}px, ${ny}px)`;
    },
    [reduced, strength],
  );

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  }, []);

  const style: CSSProperties = {
    transition: reduced ? undefined : "transform 120ms cubic-bezier(0.16,1,0.3,1)",
    display: "inline-block",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
