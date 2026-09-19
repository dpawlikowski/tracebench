"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type MotionValue,
} from "motion/react";
import { cn } from "@tracebench/ui";
import { motionTokens } from "@/lib/motion";

type ScrollSceneProps = {
  children: ReactNode;
  reduced: boolean;
  className?: string;
  /** Section id without story- prefix already applied by parent */
  id?: string;
  /** Entrance only (once) vs scrub opacity/y while in view */
  mode?: "enter" | "scrub";
  /**
   * Scrub intensity — how much y travel (px) at section edges.
   * Keep modest to avoid empty voids / layout jumps.
   */
  intensity?: "calm" | "drama";
  "data-testid"?: string;
};

/**
 * Scene wrapper — Inkwell-style chapter beat.
 * enter: mask-up + fade once in view
 * scrub: opacity/y linked to section scroll progress (no empty voids)
 */
export function ScrollScene({
  children,
  reduced,
  className,
  id,
  mode = "enter",
  intensity = "calm",
  "data-testid": testId,
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: mode === "enter", amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yEnter = intensity === "drama" ? 36 : 24;
  const yExit = intensity === "drama" ? -16 : -10;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.42, 1, 1, 0.5],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [yEnter, 0, 0, yExit],
  );

  if (reduced) {
    return (
      <section ref={ref} id={id} className={className} data-testid={testId}>
        {children}
      </section>
    );
  }

  if (mode === "scrub") {
    return (
      <motion.section
        ref={ref}
        id={id}
        className={className}
        style={{ opacity, y }}
        data-testid={testId}
      >
        {children}
      </motion.section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      data-testid={testId}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{
        duration: motionTokens.duration.enter,
        ease: motionTokens.ease.out,
      }}
    >
      {children}
    </motion.section>
  );
}

type ParallaxLayerProps = {
  children: ReactNode;
  reduced: boolean;
  className?: string;
  /** Positive = drifts slower (recedes); negative = advances */
  speed?: number;
  /** Optional shared progress from a parent section */
  progress?: MotionValue<number>;
};

/**
 * Lightweight parallax child — use inside a scrub chapter for depth
 * without sticky tracks or empty voids. Honors prefers-reduced-motion.
 */
export function ParallaxLayer({
  children,
  reduced,
  className,
  speed = 0.12,
  progress: externalProgress,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: localProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = externalProgress ?? localProgress;
  const travel = Math.round(48 * speed);
  const y = useTransform(progress, [0, 1], [travel, -travel]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Clip-path mask reveal for display lines (award-site typography beat). */
export function ClipReveal({
  children,
  reduced,
  delay = 0,
  className,
}: {
  children: ReactNode;
  reduced: boolean;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("tb-clip-mask", className)}>
      <motion.div
        initial={{ y: "110%", opacity: 0.3 }}
        animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0.3 }}
        transition={{
          duration: 0.55,
          ease: motionTokens.ease.out,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Stagger children with clip/fade — use inside a scene. */
export function StaggerBlock({
  children,
  reduced,
  className,
  delay = 0,
}: {
  children: ReactNode;
  reduced: boolean;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: motionTokens.duration.enter,
        ease: motionTokens.ease.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Act banner — film chapter divider */
export function ActBanner({
  act,
  title,
  reduced,
}: {
  act: string;
  title: string;
  reduced: boolean;
}) {
  return (
    <StaggerBlock reduced={reduced} className="mb-8 flex items-center gap-4">
      <span className="tb-act-label">{act}</span>
      <span className="h-px flex-1 bg-tb-border" aria-hidden />
      <span className="text-[11px] font-medium tracking-tight text-tb-text-dim">
        {title}
      </span>
    </StaggerBlock>
  );
}
