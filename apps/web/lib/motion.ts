/**
 * Shared Motion tokens — Phosphor Instrument.
 * No bounce springs. Prefer transform/opacity; honor prefers-reduced-motion hard.
 */
export const motionTokens = {
  duration: {
    instant: 0.01,
    fast: 0.12,
    base: 0.16,
    slow: 0.18,
    enter: 0.42,
  },
  ease: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.45, 0, 0.55, 1] as const,
    linear: "linear" as const,
  },
  /** Stagger cap so long lists don't feel sluggish */
  stagger: (index: number, step = 0.028, cap = 0.2) =>
    Math.min(index * step, cap),
} as const;

export type FadeSlideOpts = {
  reduced?: boolean;
  delay?: number;
};

export function fadeSlide(opts: FadeSlideOpts = {}) {
  if (opts.reduced) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.out,
      delay: opts.delay ?? 0,
    },
  };
}

export function pressScale(reduced?: boolean) {
  if (reduced) return {};
  return { whileTap: { scale: 0.98 } };
}
