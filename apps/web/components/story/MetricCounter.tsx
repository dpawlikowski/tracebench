"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useSpring, useMotionValueEvent } from "motion/react";
import { useReducedMotion } from "@/lib/prefs";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** When true, skip animation and show final value */
  forceStatic?: boolean;
};

export function MetricCounter({ value, prefix = "", suffix = "", forceStatic }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const motionVal = useSpring(0, { stiffness: 80, damping: 28, mass: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced || forceStatic) {
      setDisplay(value);
      return;
    }
    if (inView) motionVal.set(value);
  }, [inView, value, reduced, forceStatic, motionVal]);

  useMotionValueEvent(motionVal, "change", (v) => {
    setDisplay(Math.round(v));
  });

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
