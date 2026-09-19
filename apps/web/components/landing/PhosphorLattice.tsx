"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/prefs";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
};

const MAX_PARTICLES = 120;
const DPR_CAP = 1.5;

/**
 * Optional phosphor particle lattice. Pauses when offscreen / tab hidden.
 * Not loaded when prefers-reduced-motion.
 */
export function PhosphorLattice({
  className,
  assemble = 1,
}: {
  className?: string;
  /** 0 = chaos, 1 = snapped lattice */
  assemble?: number;
}) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assembleRef = useRef(assemble);
  assembleRef.current = assemble;

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let w = 0;
    let h = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const cols = 10;
      const rows = 8;
      const count = Math.min(MAX_PARTICLES, cols * rows);
      const padX = w * 0.12;
      const padY = h * 0.14;
      const cellW = (w - padX * 2) / (cols - 1);
      const cellH = (h - padY * 2) / (rows - 1);
      particles = [];
      for (let i = 0; i < count; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const tx = padX + c * cellW;
        const ty = padY + r * cellH;
        particles.push({
          x: tx + (Math.random() - 0.5) * w * 0.5,
          y: ty + (Math.random() - 0.5) * h * 0.5,
          tx,
          ty,
          vx: 0,
          vy: 0,
          r: 1 + (i % 3) * 0.4,
        });
      }
    }

    function tick() {
      if (!running || !visible) return;
      const a = Math.min(1, Math.max(0, assembleRef.current));
      ctx!.clearRect(0, 0, w, h);

      // faint links when assembled
      if (a > 0.35) {
        ctx!.strokeStyle = `rgba(184,255,61,${0.06 * a})`;
        ctx!.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const next = particles[i + 1];
          if (next && i % 10 !== 9) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(next.x, next.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        if (a >= 0.98) {
          // Snap to lattice — avoids endless micro-jitter if parent rAF stalled mid-way then jumped
          p.x = p.tx;
          p.y = p.ty;
          p.vx = 0;
          p.vy = 0;
        } else {
          const pull = 0.04 + a * 0.12;
          p.vx += (p.tx - p.x) * pull;
          p.vy += (p.ty - p.y) * pull;
          // residual chaos when a low
          if (a < 0.85) {
            p.vx += (Math.random() - 0.5) * (1 - a) * 0.6;
            p.vy += (Math.random() - 0.5) * (1 - a) * 0.6;
          }
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
        const glow = a > 0.7 && Math.hypot(p.x - p.tx, p.y - p.ty) < 2;
        ctx!.fillStyle = glow
          ? "rgba(184,255,61,0.95)"
          : `rgba(184,255,61,${0.35 + a * 0.45})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e?.isIntersecting;
        if (visible && document.visibilityState === "visible") start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.visibilityState === "hidden") stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-testid="phosphor-lattice"
      className={className ?? "pointer-events-none absolute inset-0 z-0"}
    />
  );
}
