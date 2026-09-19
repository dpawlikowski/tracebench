"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "motion/react";
import { Button, Badge, Card, cn } from "@tracebench/ui";
import { GrainOverlay } from "@/components/landing/GrainOverlay";
import { ControlPlaneAssembly } from "@/components/landing/ControlPlaneAssembly";
import { MagneticCta } from "@/components/landing/MagneticCta";
import { useReducedMotion } from "@/lib/prefs";
import { motionTokens } from "@/lib/motion";
import { MetricCounter } from "./MetricCounter";
import { StoryProgressRail } from "./StoryProgressRail";
import {
  ANSWER_PILLARS,
  BREAKS,
  ILLUSTRATIVE_FOOTNOTE,
  METRICS,
  PRODUCT_FRAMES,
  STORY_SECTIONS,
  type StorySectionId,
} from "./story-copy";

function SectionReveal({
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
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StoryExperience() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<StorySectionId>("hero");
  const [activeBreak, setActiveBreak] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<(typeof PRODUCT_FRAMES)[number] | null>(
    null,
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      const unsub = scrollYProgress.on("change", (v) => setProgress(v));
      return unsub;
    }
    const unsub = smoothProgress.on("change", (v) => setProgress(v));
    return unsub;
  }, [smoothProgress, scrollYProgress, reduced]);

  const howRef = useRef<HTMLDivElement>(null);
  const howInView = useInView(howRef, { amount: 0.15 });
  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ["start start", "end end"],
  });
  const frameIndex = useTransform(
    howProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, 1, 2, 3, 4, 4],
  );
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const unsub = frameIndex.on("change", (v) => setFrame(Math.round(v)));
    return unsub;
  }, [frameIndex]);

  const jumpToFrame = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(PRODUCT_FRAMES.length - 1, i));
      if (reduced) {
        setFrame(clamped);
        return;
      }
      const el = howRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const span = el.offsetHeight - window.innerHeight;
      const t = clamped / Math.max(1, PRODUCT_FRAMES.length - 1);
      window.scrollTo({
        top: top + span * t,
        behavior: "smooth",
      });
    },
    [reduced],
  );

  // Keyboard ←/→ when how-teams section is in view
  useEffect(() => {
    if (!howInView) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        jumpToFrame(frame + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        jumpToFrame(frame - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [howInView, frame, jumpToFrame]);

  useEffect(() => {
    const nodes = STORY_SECTIONS.map((s) => document.getElementById(`story-${s.id}`)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target?.id) return;
        const id = top.target.id.replace("story-", "") as StorySectionId;
        if (STORY_SECTIONS.some((s) => s.id === id)) setActive(id);
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const jump = useCallback(
    (id: StorySectionId) => {
      const el = document.getElementById(`story-${id}`);
      el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced],
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-tb-bg text-tb-text"
      data-testid="story-page"
    >
      <GrainOverlay />
      <StoryProgressRail
        active={active}
        progress={progress}
        reduced={reduced}
        onJump={jump}
      />

      {/* 1 · Hero */}
      <section
        id="story-hero"
        className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-6 pb-20 pt-16 md:px-10 lg:px-16"
      >
        <div className="tb-grid-atmosphere opacity-25" aria-hidden />
        <SectionReveal
          reduced={reduced}
          className="relative z-[1] mx-auto grid w-full max-w-[1100px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <div>
            <p className="tb-section-label m-0">Business story</p>
            <h1 className="tb-display mb-5 mt-4 max-w-[820px] text-[clamp(34px,5.5vw,58px)] text-tb-text">
              Ship agents that touch money — without flying blind.
            </h1>
            <p className="mb-8 max-w-[560px] text-[16px] leading-relaxed text-tb-text-muted">
              Tracebench is the HITL control plane for tool-calling agents: timeline, risk-tiered
              approvals, audit, cost, and eval gates. Chat is secondary. Governance is the product.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticCta>
                <Link href="/runs/run_live_approve" className="no-underline hover:no-underline">
                  <Button variant="primary" size="lg" data-testid="story-hero-demo">
                    Open Demo Mode
                  </Button>
                </Link>
              </MagneticCta>
              <button
                type="button"
                onClick={() => jump("blind-spot")}
                className="tb-interactive rounded-md border border-tb-border bg-transparent px-4 py-2.5 text-sm font-medium text-tb-text-muted hover:border-tb-border-strong hover:text-tb-text"
              >
                Read the story ↓
              </button>
            </div>
          </div>
          <div>
            <ControlPlaneAssembly interactive />
            <p className="mt-2 text-[12px] text-tb-text-dim">
              Click layers to inspect roles — Replay re-runs the assemble.
            </p>
          </div>
        </SectionReveal>
      </section>

      {/* 2 · Blind spot */}
      <section
        id="story-blind-spot"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <SectionReveal
          reduced={reduced}
          className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <p className="tb-section-label m-0">01 · The blind spot</p>
            <h2 className="mt-3 tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              Agents already touch money and config. Most teams still lack a control room.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-tb-text-muted">
              Ops agents draft emails, move funds, deploy configs, and fan out into nested workers.
              The interface they get is usually a chat transcript — not a place to pause, approve,
              measure burn, or prove what happened.
            </p>
          </div>
          <Card padding={20} className="border-tb-border/80 bg-tb-bg-elevated/60">
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="danger">ungoverned</Badge>
              <span className="text-[11px] tracking-tight text-tb-text-dim">without a plane</span>
            </div>
            <ul className="m-0 list-none space-y-3 p-0 text-[13px] leading-relaxed text-tb-text-muted">
              <li className="border-l-2 border-risk-high/50 pl-3">
                Payments and deploys fire from prompts with no risk tier.
              </li>
              <li className="border-l-2 border-risk-medium/50 pl-3">
                Cost spikes show up in invoices, not beside the tool call.
              </li>
              <li className="border-l-2 border-tb-border-strong pl-3">
                Audit prep means reconstructing intent from Slack threads.
              </li>
            </ul>
          </Card>
        </SectionReveal>
      </section>

      {/* 3 · What breaks — interactive select */}
      <section
        id="story-what-breaks"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0">02 · What breaks</p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              The cost of ungoverned agents is not theoretical.
            </h2>
            <p className="mt-2 text-[13px] text-tb-text-dim">
              Select a failure mode to see how Tracebench answers it.
            </p>
          </SectionReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2" data-testid="story-breaks">
            {BREAKS.map((b, i) => {
              const open = activeBreak === b.id;
              return (
                <SectionReveal key={b.id} reduced={reduced} delay={reduced ? 0 : i * 0.05}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    data-testid={`story-break-${b.id}`}
                    onClick={() => setActiveBreak(open ? null : b.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveBreak(open ? null : b.id);
                      }
                    }}
                    className={cn(
                      "h-full w-full cursor-pointer rounded-md border p-[18px] text-left outline-none transition-[border-color,background-color,transform] duration-150",
                      open
                        ? "border-tb-accent/50 bg-tb-accent-soft/20"
                        : "border-tb-border/80 bg-tb-bg-elevated hover:border-tb-border-strong hover:bg-tb-bg-hover",
                      !reduced && "hover:-translate-y-0.5",
                    )}
                  >
                    <h3 className="m-0 text-[15px] font-semibold">{b.title}</h3>
                    <p className="mb-0 mt-2 text-[13px] leading-relaxed text-tb-text-muted">
                      {b.body}
                    </p>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200",
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                      style={{ transitionDuration: reduced ? "0ms" : undefined }}
                    >
                      <div className="overflow-hidden">
                        <p className="mb-0 mt-3 border-t border-tb-border pt-3 text-[12px] leading-relaxed text-tb-text">
                          {b.deep}
                        </p>
                        <Link
                          href={b.href}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 inline-flex text-[12px] font-medium text-tb-accent no-underline hover:underline"
                        >
                          See it in Demo Mode →
                        </Link>
                      </div>
                    </div>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 · Answer — interactive pillars */}
      <section
        id="story-answer"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0 text-tb-accent">03 · The Tracebench answer</p>
            <h2 className="mt-3 max-w-[720px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              A control plane — not another chat wrapper.
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-tb-text-muted">
              Event log as truth. Jev for risk policy. HITL for irreversible tools. Evals before
              ship. A2A and boards so multi-agent work stays inspectable.
            </p>
            <p className="mt-2 text-[13px] text-tb-text-dim">
              Select one pillar — only one deep dive at a time.
            </p>
          </SectionReveal>
          <div
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="story-pillars"
          >
            {ANSWER_PILLARS.map((p, i) => {
              const open = activePillar === p.id;
              return (
                <SectionReveal key={p.id} reduced={reduced} delay={reduced ? 0 : i * 0.04}>
                  <button
                    type="button"
                    aria-expanded={open}
                    data-testid={`story-pillar-${p.id}`}
                    onClick={() => setActivePillar(open ? null : p.id)}
                    className={cn(
                      "flex h-full w-full flex-col border p-4 text-left outline-none transition-colors duration-150",
                      open
                        ? "border-tb-accent/50 bg-tb-accent-soft/15"
                        : "border-tb-border bg-tb-bg-elevated hover:bg-tb-bg-hover",
                    )}
                  >
                    <div className="mb-2 font-mono text-[11px] text-tb-accent tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="m-0 text-[14px] font-semibold">{p.title}</h3>
                    <p className="mb-0 mt-2 text-[12px] leading-relaxed text-tb-text-muted">
                      {p.body}
                    </p>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200",
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                      style={{ transitionDuration: reduced ? "0ms" : undefined }}
                    >
                      <div className="overflow-hidden">
                        <p className="mb-0 mt-3 border-t border-tb-border pt-3 text-[12px] leading-relaxed text-tb-text">
                          {p.deep}
                        </p>
                      </div>
                    </div>
                  </button>
                </SectionReveal>
              );
            })}
          </div>
          <SectionReveal reduced={reduced} className="mt-10" delay={reduced ? 0 : 0.08}>
            <p className="tb-section-label mb-3">Control plane assembly</p>
            <ControlPlaneAssembly compact interactive />
          </SectionReveal>
        </div>
      </section>

      {/* 5 · Outcomes — metric definition on focus/hover */}
      <section
        id="story-outcomes"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0">04 · Business outcomes</p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              What governance buys — in numbers teams recognize.
            </h2>
            <p className="mt-3 text-[13px] text-tb-text-dim" data-testid="story-metrics-footnote">
              * {ILLUSTRATIVE_FOOTNOTE}
            </p>
            <p className="mt-1 text-[13px] text-tb-text-dim">
              Focus or tap a metric to see what it means inside Tracebench.
            </p>
          </SectionReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map((m, i) => {
              const open = activeMetric === m.id;
              return (
                <SectionReveal key={m.id} reduced={reduced} delay={reduced ? 0 : i * 0.05}>
                  <button
                    type="button"
                    aria-expanded={open}
                    data-testid={`story-metric-${m.id}`}
                    onClick={() => setActiveMetric(open ? null : m.id)}
                    onFocus={() => setActiveMetric(m.id)}
                    className={cn(
                      "h-full w-full rounded-md border p-5 text-left outline-none transition-colors duration-150",
                      open
                        ? "border-tb-accent/45 bg-tb-bg-elevated"
                        : "border-tb-border bg-tb-bg-elevated hover:border-tb-border-strong",
                    )}
                  >
                    <div className="text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-tb-text">
                      <MetricCounter
                        value={m.value}
                        prefix={"prefix" in m ? m.prefix : ""}
                        suffix={m.suffix}
                        forceStatic={reduced}
                      />
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-tb-accent">{m.range}</div>
                    <div className="mt-3 text-[14px] font-semibold">{m.label}</div>
                    <p className="mb-0 mt-2 text-[12px] leading-relaxed text-tb-text-muted">
                      {m.detail}
                    </p>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200",
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                      style={{ transitionDuration: reduced ? "0ms" : undefined }}
                    >
                      <div className="overflow-hidden">
                        <p className="mb-0 mt-3 rounded border border-tb-accent/25 bg-tb-accent-soft/20 px-2.5 py-2 text-[11px] leading-relaxed text-tb-text">
                          <span className="font-medium text-tb-accent">In Tracebench · </span>
                          {m.definition}
                        </p>
                      </div>
                    </div>
                    <p className="mb-0 mt-3 text-[10px] tracking-wider text-tb-text-dim">
                      Illustrative
                    </p>
                  </button>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 · How teams work — sticky + keyboard */}
      <section id="story-how-teams" ref={howRef} className="relative border-t border-tb-border/60">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 lg:px-16">
          <div className="py-16 md:py-20">
            <p className="tb-section-label m-0">05 · How teams work</p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              Sticky ops loop — copy on the left, product on the right.
            </h2>
            <p className="mt-2 text-[13px] text-tb-text-dim">
              Click frames, or use ← → when this chapter is in view. Click the image to open the
              real Demo Mode route.
            </p>
          </div>

          <div
            className="relative hidden md:block"
            style={{
              height: reduced
                ? "auto"
                : `calc(100vh + ${Math.max(1, PRODUCT_FRAMES.length - 1) * 70}vh)`,
            }}
          >
            <div
              className={
                reduced
                  ? "grid grid-cols-2 gap-10 pb-20"
                  : "sticky top-16 grid h-[calc(100vh-5rem)] grid-cols-2 gap-10 pb-8"
              }
            >
              <div className="flex flex-col justify-center pr-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge tone="accent" className="w-fit">
                    Frame {frame + 1} / {PRODUCT_FRAMES.length}
                  </Badge>
                  <span className="text-[11px] text-tb-text-dim">← → to scrub</span>
                </div>
                <h3 className="m-0 text-[22px] font-semibold tracking-tight leading-snug">
                  {PRODUCT_FRAMES[frame]?.chapter}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-tb-text-muted">
                  {PRODUCT_FRAMES[frame]?.caption}
                </p>
                <ol className="mt-8 m-0 list-none space-y-2 p-0">
                  {PRODUCT_FRAMES.map((f, i) => (
                    <li key={f.src}>
                      <button
                        type="button"
                        onClick={() => jumpToFrame(i)}
                        className={cn(
                          "block w-full rounded-sm border px-3 py-2 text-left text-[12px] transition-colors",
                          i === frame
                            ? "border-tb-accent/50 bg-tb-accent-soft text-tb-text"
                            : "border-transparent text-tb-text-dim hover:border-tb-border hover:text-tb-text-muted",
                        )}
                        data-testid={`story-frame-nav-${i}`}
                      >
                        {f.caption.split(" — ")[0]}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => jumpToFrame(frame - 1)}
                    disabled={frame <= 0}
                    className="rounded-md border border-tb-border px-3 py-1.5 text-[12px] text-tb-text-muted disabled:opacity-40 hover:border-tb-border-strong hover:text-tb-text"
                    aria-label="Previous frame"
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToFrame(frame + 1)}
                    disabled={frame >= PRODUCT_FRAMES.length - 1}
                    className="rounded-md border border-tb-border px-3 py-1.5 text-[12px] text-tb-text-muted disabled:opacity-40 hover:border-tb-border-strong hover:text-tb-text"
                    aria-label="Next frame"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <ProductFrame
                  frame={PRODUCT_FRAMES[frame]!}
                  reduced={reduced}
                  onOpen={() => setLightbox(PRODUCT_FRAMES[frame]!)}
                />
              </div>
            </div>
            {!reduced && <div aria-hidden className="h-px" />}
          </div>

          <div className="flex flex-col gap-10 pb-20 md:hidden">
            {PRODUCT_FRAMES.map((f) => (
              <div key={f.src}>
                <h3 className="m-0 text-[18px] font-semibold">{f.chapter}</h3>
                <p className="mt-2 text-[13px] text-tb-text-muted">{f.caption}</p>
                <div className="mt-4">
                  <ProductFrame frame={f} reduced onOpen={() => setLightbox(f)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Proof */}
      <section
        id="story-proof"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <SectionReveal
          reduced={reduced}
          className="mx-auto flex max-w-[980px] flex-col gap-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="max-w-[520px]">
            <p className="tb-section-label m-0 text-tb-success">06 · Proof strip</p>
            <h2 className="mt-3 tb-display text-[clamp(24px,3.5vw,34px)] text-tb-text">
              Demo Mode. Zero keys. Fixtures that fail honestly.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-tb-text-muted">
              Defaults are <code className="font-mono text-[13px] text-tb-accent">fixture</code>{" "}
              transport + <code className="font-mono text-[13px] text-tb-accent">mock-jev</code>.
              Seeded HITL, denied high-risk, cost regression, and nested A2A — no empty happy path.
            </p>
          </div>
          <Card padding={20} className="min-w-[260px] border-tb-success/30 bg-tb-success-soft/10">
            <ul className="m-0 list-none space-y-2 p-0 font-mono text-[12px] text-tb-text-muted">
              <li>AGENT_TRANSPORT=fixture</li>
              <li>JEV_ADAPTER=mock</li>
              <li>EVAL_SCORER=mock-jev</li>
              <li className="pt-2 text-tb-success">demoMode.kind=demo</li>
            </ul>
            <Link
              href="/help/demo-mode"
              className="mt-4 inline-block text-[13px] font-medium text-tb-accent no-underline hover:underline"
            >
              90s click path →
            </Link>
          </Card>
        </SectionReveal>
      </section>

      {/* 8 · Start (CTA chapter — must feel dense, not empty) */}
      <section
        id="story-cta"
        className="relative overflow-hidden border-t border-tb-border/60 px-6 pb-16 pt-20 md:px-10 lg:px-16"
        data-testid="story-start"
      >
        <div className="tb-grid-atmosphere pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <SectionReveal reduced={reduced} className="relative z-[1] mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="tb-section-label m-0">07 · Start</p>
            <h2 className="tb-display mt-3 m-0 text-[clamp(28px,4vw,42px)] text-tb-text">
              Open the control room.
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-tb-text-muted">
              You&apos;ve seen the blind spot, the breaks, and the plane. Pick a door — each one is
              live Demo Mode, no keys.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <MagneticCta>
                <Link href="/runs/run_live_approve" className="no-underline hover:no-underline">
                  <Button variant="primary" size="lg" data-testid="story-cta-demo">
                    Open live approval demo
                  </Button>
                </Link>
              </MagneticCta>
              <MagneticCta strength={4}>
                <Link href="/" className="no-underline hover:no-underline">
                  <Button variant="secondary" size="lg" data-testid="story-cta-overview">
                    Product overview
                  </Button>
                </Link>
              </MagneticCta>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/runs/run_live_approve",
                kicker: "01 · Feel it",
                title: "Live HITL gate",
                body: "Approve or deny an irreversible tool. Keyboard-first, audit-ready.",
                testid: "story-start-card-demo",
              },
              {
                href: "/evals",
                kicker: "02 · Gate it",
                title: "Eval scorecard",
                body: "See pass rate beside cost and latency before you ship a change.",
                testid: "story-start-card-evals",
              },
              {
                href: "/help",
                kicker: "03 · Orient",
                title: "FAQ & tour",
                body: "90-second Demo Mode path, glossary, and product tour.",
                testid: "story-cta-help",
              },
              {
                href: "/architecture",
                kicker: "04 · Dig in",
                title: "Architecture",
                body: "Transport, Jev tiers, fixtures — how the control plane is wired.",
                testid: "story-cta-arch",
              },
            ].map((card) => (
              <Link
                key={card.href + card.title}
                href={card.href}
                data-testid={card.testid}
                className="group flex flex-col rounded-md border border-tb-border bg-tb-bg-elevated/80 p-4 text-left no-underline transition-colors hover:border-tb-border-strong hover:bg-tb-bg-elevated"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-tb-text-dim">
                  {card.kicker}
                </span>
                <span className="mt-2 text-[15px] font-semibold tracking-tight text-tb-text group-hover:text-tb-accent">
                  {card.title}
                </span>
                <span className="mt-2 flex-1 text-[13px] leading-relaxed text-tb-text-muted">
                  {card.body}
                </span>
                <span className="mt-4 text-[12px] font-medium text-tb-accent opacity-80 group-hover:opacity-100">
                  Open →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[12px] text-tb-text-dim">
            <Badge tone="accent" className="normal-case tracking-normal">
              Demo Mode
            </Badge>
            <span>Zero API keys</span>
            <span aria-hidden>·</span>
            <span>Fixtures that fail honestly</span>
            <span aria-hidden>·</span>
            <Link
              href="/evals"
              className="text-tb-text-muted no-underline hover:text-tb-text"
              data-testid="story-cta-evals"
            >
              Eval gate →
            </Link>
          </div>

          <p className="mx-auto mt-8 max-w-[640px] text-center text-[11px] leading-relaxed text-tb-text-dim">
            * {ILLUSTRATIVE_FOOTNOTE}
          </p>
        </SectionReveal>
      </section>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          data-testid="story-frame-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-tb-border-strong bg-tb-bg-elevated shadow-[var(--tb-shadow-modal)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-tb-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="absolute inset-0 h-full w-full object-contain object-top"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tb-border px-4 py-3">
              <div>
                <div className="text-[13px] font-medium text-tb-text">{lightbox.caption}</div>
                <div className="text-[12px] text-tb-text-muted">{lightbox.chapter}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={lightbox.href} className="no-underline hover:no-underline">
                  <Button variant="primary" size="md" data-testid="story-lightbox-demo">
                    {lightbox.routeLabel}
                  </Button>
                </Link>
                <Button variant="ghost" size="md" onClick={() => setLightbox(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductFrame({
  frame,
  reduced,
  onOpen,
}: {
  frame: (typeof PRODUCT_FRAMES)[number];
  reduced: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.figure
      key={frame.src}
      className="m-0 w-full overflow-hidden rounded-lg border border-tb-border-strong bg-tb-bg-elevated shadow-none"
      initial={reduced ? false : { opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : motionTokens.duration.base,
        ease: motionTokens.ease.out,
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-[16/10] w-full cursor-zoom-in bg-tb-bg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tb-accent/50"
        aria-label={`Enlarge: ${frame.alt}. Opens preview with link to ${frame.routeLabel}.`}
        data-testid="story-product-frame"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public/story assets */}
        <img
          src={frame.src}
          alt={frame.alt}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      </button>
      <figcaption className="flex items-center justify-between gap-2 border-t border-tb-border px-3 py-2 text-[11px] text-tb-text-muted">
        <span>{frame.caption}</span>
        <Link
          href={frame.href}
          className="shrink-0 font-medium text-tb-accent no-underline hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {frame.routeLabel} →
        </Link>
      </figcaption>
    </motion.figure>
  );
}
