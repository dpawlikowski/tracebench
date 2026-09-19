"use client";

import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/prefs";

/** Light pointer-tracked CSS 3D tilt for a product “work” frame. */
export function WorkFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: py * -6, y: px * 8 });
    },
    [reduced],
  );

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <div className={className} style={{ perspective: 900 }}>
      <div
        ref={ref}
        data-testid="work-frame"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="overflow-hidden rounded-md border border-tb-border bg-tb-bg-elevated transition-transform duration-150 ease-out"
        style={{
          transform: reduced
            ? undefined
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
