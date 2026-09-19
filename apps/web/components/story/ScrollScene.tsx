"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
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
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: mode === "enter", amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.35, 1, 1, 0.45]);
  const y = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [28, 0, 0, -12]);

  if (reduced) {
    return (
      <section ref={ref} id={id} className={className}>
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
      <span className="text-[11px] font-medium tracking-tight text-tb-text-dim">{title}</span>
    </StaggerBlock>
  );
}

