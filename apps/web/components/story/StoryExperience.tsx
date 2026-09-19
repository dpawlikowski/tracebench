"use client";

import Image from "next/image";
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
import { Button, Badge, Card } from "@tracebench/ui";
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

  // Sticky how-teams chapter scroll
  const howRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ["start start", "end end"],
  });
  const frameIndex = useTransform(howProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 2, 3, 4, 4]);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const unsub = frameIndex.on("change", (v) => setFrame(Math.round(v)));
    return unsub;
  }, [frameIndex]);

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

  const jump = useCallback((id: StorySectionId) => {
    const el = document.getElementById(`story-${id}`);
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [reduced]);

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
        <div className="tb-grid-atmosphere opacity-70" aria-hidden />
        <SectionReveal reduced={reduced} className="relative z-[1] mx-auto grid w-full max-w-[1100px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="tb-section-label m-0 text-tb-accent">Business story · Tracebench</p>
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
                className="tb-interactive rounded-sm border border-tb-border bg-transparent px-4 py-2.5 text-sm font-medium text-tb-text-muted hover:border-tb-border-strong hover:text-tb-text"
              >
                Read the story ↓
              </button>
            </div>
          </div>
          <ControlPlaneAssembly progress={reduced ? 1 : Math.min(1, progress * 2.2)} />
        </SectionReveal>
      </section>

      {/* 2 · Blind spot */}
      <section
        id="story-blind-spot"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <SectionReveal reduced={reduced} className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="tb-section-label m-0">
              01 · The blind spot
            </p>
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
              <span className="text-[11px] uppercase tracking-wider text-tb-text-dim">
                without a plane
              </span>
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

      {/* 3 · What breaks */}
      <section
        id="story-what-breaks"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0">
              02 · What breaks
            </p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              The cost of ungoverned agents is not theoretical.
            </h2>
          </SectionReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {BREAKS.map((b, i) => (
              <SectionReveal key={b.title} reduced={reduced} delay={reduced ? 0 : i * 0.05}>
                <Card padding={18} className="h-full border-tb-border/80">
                  <h3 className="m-0 text-[15px] font-semibold">{b.title}</h3>
                  <p className="mb-0 mt-2 text-[13px] leading-relaxed text-tb-text-muted">{b.body}</p>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Answer */}
      <section
        id="story-answer"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0 text-tb-accent">
              03 · The Tracebench answer
            </p>
            <h2 className="mt-3 max-w-[720px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              A control plane — not another chat wrapper.
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-tb-text-muted">
              Event log as truth. Jev for risk policy. HITL for irreversible tools. Evals before
              ship. A2A and boards so multi-agent work stays inspectable.
            </p>
          </SectionReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ANSWER_PILLARS.map((p, i) => (
              <SectionReveal key={p.title} reduced={reduced} delay={reduced ? 0 : i * 0.04}>
                <div className="h-full border border-tb-border bg-tb-bg-elevated p-4 transition-colors duration-150 hover:bg-tb-bg-hover">
                  <div className="mb-2 font-mono text-[11px] text-tb-accent tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="m-0 text-[14px] font-semibold">{p.title}</h3>
                  <p className="mb-0 mt-2 text-[12px] leading-relaxed text-tb-text-muted">{p.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
          <SectionReveal reduced={reduced} className="mt-10" delay={reduced ? 0 : 0.08}>
            <p className="tb-section-label mb-3">Control plane assembly</p>
            <ControlPlaneAssembly compact />
          </SectionReveal>
        </div>
      </section>

      {/* 5 · Outcomes */}
      <section
        id="story-outcomes"
        className="relative border-t border-tb-border/60 px-6 py-24 md:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[980px]">
          <SectionReveal reduced={reduced}>
            <p className="tb-section-label m-0">
              04 · Business outcomes
            </p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              What governance buys — in numbers teams recognize.
            </h2>
            <p className="mt-3 text-[13px] text-tb-text-dim" data-testid="story-metrics-footnote">
              * {ILLUSTRATIVE_FOOTNOTE}
            </p>
          </SectionReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map((m, i) => (
              <SectionReveal key={m.id} reduced={reduced} delay={reduced ? 0 : i * 0.05}>
                <div data-testid={`story-metric-${m.id}`} className="h-full">
                <Card
                  padding={20}
                  className="h-full border-tb-border bg-tb-bg-elevated shadow-none"
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
                  <p className="mb-0 mt-2 text-[12px] leading-relaxed text-tb-text-muted">{m.detail}</p>
                  <p className="mb-0 mt-3 text-[10px] uppercase tracking-wider text-tb-text-dim">
                    Illustrative
                  </p>
                </Card>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · How teams work — sticky */}
      <section
        id="story-how-teams"
        ref={howRef}
        className="relative border-t border-tb-border/60"
      >
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 lg:px-16">
          <div className="py-16 md:py-20">
            <p className="tb-section-label m-0">
              05 · How teams work
            </p>
            <h2 className="mt-3 max-w-[640px] tb-display text-[clamp(24px,3.5vw,36px)] text-tb-text">
              Sticky ops loop — copy on the left, product on the right.
            </h2>
          </div>

          {/* Desktop sticky split */}
          <div className="relative hidden md:block" style={{ height: reduced ? "auto" : "280vh" }}>
            <div
              className={
                reduced
                  ? "grid grid-cols-2 gap-10 pb-20"
                  : "sticky top-16 grid h-[calc(100vh-5rem)] grid-cols-2 gap-10 pb-8"
              }
            >
              <div className="flex flex-col justify-center pr-4">
                <Badge tone="accent" className="mb-4 w-fit">
                  Frame {frame + 1} / {PRODUCT_FRAMES.length}
                </Badge>
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
                        onClick={() => {
                          if (reduced) {
                            setFrame(i);
                            return;
                          }
                          const el = howRef.current;
                          if (!el) return;
                          const rect = el.getBoundingClientRect();
                          const top = window.scrollY + rect.top;
                          const span = el.offsetHeight - window.innerHeight;
                          const t = i / Math.max(1, PRODUCT_FRAMES.length - 1);
                          window.scrollTo({
                            top: top + span * t,
                            behavior: "smooth",
                          });
                        }}
                        className={`block w-full rounded-sm border px-3 py-2 text-left text-[12px] transition-colors ${
                          i === frame
                            ? "border-tb-accent/50 bg-tb-accent-soft text-tb-text"
                            : "border-transparent text-tb-text-dim hover:border-tb-border hover:text-tb-text-muted"
                        }`}
                      >
                        {f.caption.split(" — ")[0]}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex items-center">
                <ProductFrame frame={PRODUCT_FRAMES[frame]!} reduced={reduced} />
              </div>
            </div>
            {!reduced && <div aria-hidden className="h-px" />}
          </div>

          {/* Mobile: stacked */}
          <div className="flex flex-col gap-10 pb-20 md:hidden">
            {PRODUCT_FRAMES.map((f) => (
              <div key={f.src}>
                <h3 className="m-0 text-[18px] font-semibold">{f.chapter}</h3>
                <p className="mt-2 text-[13px] text-tb-text-muted">{f.caption}</p>
                <div className="mt-4">
                  <ProductFrame frame={f} reduced />
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
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-tb-success">
              06 · Proof strip
            </p>
            <h2 className="mt-3 text-[clamp(24px,3.5vw,34px)] font-bold tracking-tight leading-tight">
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

      {/* 8 · CTA */}
      <section
        id="story-cta"
        className="relative border-t border-tb-border/60 px-6 py-28 md:px-10 lg:px-16"
      >
        <SectionReveal reduced={reduced} className="mx-auto max-w-[720px] text-center">
          <h2 className="tb-display m-0 text-[clamp(28px,4vw,40px)] text-tb-text">
            Open the control room.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-tb-text-muted">
            Start with the live approval demo, skim the FAQ, or read the architecture — then
            decide if your agents deserve a plane.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticCta>
              <Link href="/runs/run_live_approve" className="no-underline hover:no-underline">
                <Button variant="primary" size="lg" data-testid="story-cta-demo">
                  Open demo
                </Button>
              </Link>
            </MagneticCta>
            <Link href="/help" className="no-underline hover:no-underline">
              <Button variant="secondary" size="lg">
                FAQ / Help
              </Button>
            </Link>
            <Link href="/architecture" className="no-underline hover:no-underline">
              <Button variant="ghost" size="lg">
                Architecture
              </Button>
            </Link>
          </div>
          <p className="mt-10 text-[11px] leading-relaxed text-tb-text-dim">
            * {ILLUSTRATIVE_FOOTNOTE}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-[13px] text-tb-text-muted no-underline hover:text-tb-text"
          >
            ← Back to product overview
          </Link>
        </SectionReveal>
      </section>
    </div>
  );
}

function ProductFrame({
  frame,
  reduced,
}: {
  frame: (typeof PRODUCT_FRAMES)[number];
  reduced: boolean;
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
      <div className="relative aspect-[16/10] w-full bg-tb-bg">
        {/* eslint-disable-next-line @next/next/no-img-element -- static public/story assets */}
        <img
          src={frame.src}
          alt={frame.alt}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption className="border-t border-tb-border px-3 py-2 text-[11px] text-tb-text-muted">
        {frame.caption}
      </figcaption>
    </motion.figure>
  );
}
