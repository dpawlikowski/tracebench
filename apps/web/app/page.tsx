import Link from "next/link";
import { Button, Card, Badge } from "@tracebench/ui";
import { TOOL_CATALOG } from "@tracebench/fixtures";
import { GrainOverlay } from "@/components/landing/GrainOverlay";

export default function LandingPage() {
  return (
    <div className="relative mx-auto max-w-[960px] overflow-hidden px-6 pb-20 pt-12">
      <GrainOverlay />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-tb-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 z-0 h-64 w-64 rounded-full bg-risk-high/10 blur-3xl"
      />

      <div className="relative z-[1]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-tb-accent">
          Agent Ops Workbench
        </p>
        <h1 className="mb-4 mt-3 max-w-[640px] text-[clamp(28px,5vw,42px)] font-bold leading-[1.15] tracking-tight">
          HITL control room for AI agents — timeline, approvals, audit, eval gates.
        </h1>
        <p className="mb-3 mt-0 max-w-[560px] text-base leading-relaxed text-tb-text-muted">
          Tracebench is a Senior FE portfolio showpiece: a calm ops surface for supervising
          tool-calling agents. Chat is secondary. Replay seeded OpsAgent runs with risk-tiered
          approvals — no API keys required.
        </p>
        <p
          className="mb-7 font-mono text-[13px] text-tb-text-dim tabular-nums"
          data-testid="landing-microcopy"
        >
          1 awaiting · $0.22 burn · Jev escalated 2
        </p>
        <div className="mb-12 flex flex-wrap gap-3" data-tour="landing-ctas">
          <Link href="/runs/run_live_approve" prefetch className="no-underline hover:no-underline">
            <Button variant="primary" size="lg">
              Open live approval demo
            </Button>
          </Link>
          <Link href="/runs" prefetch className="no-underline hover:no-underline">
            <Button variant="secondary" size="lg">
              Browse runs
            </Button>
          </Link>
          <Link href="/evals" className="no-underline hover:no-underline">
            <Button variant="ghost" size="lg">
              Eval scorecard
            </Button>
          </Link>
          <Link href="/policy" className="no-underline hover:no-underline">
            <Button variant="ghost" size="lg">
              Risk policy
            </Button>
          </Link>
          <Link href="/help/faq" prefetch className="no-underline hover:no-underline">
            <Button variant="ghost" size="lg" data-testid="landing-faq-cta">
              FAQ & tour
            </Button>
          </Link>
          <Link href="/story" prefetch className="no-underline hover:no-underline">
            <Button variant="secondary" size="lg" data-testid="landing-story-cta">
              Read the story
            </Button>
          </Link>
        </div>

        <div
          className="mb-10 rounded-md border border-tb-accent/30 bg-tb-accent-soft/20 p-4"
          data-testid="landing-story-teaser"
        >
          <div className="mb-1 text-sm font-semibold text-tb-text">Why Tracebench</div>
          <p className="m-0 mb-2 max-w-[560px] text-[13px] leading-relaxed text-tb-text-muted">
            A cinematic business narrative: ungoverned agents → control plane → illustrative
            outcomes → Demo Mode. Ops routes stay here; the story lives at{" "}
            <Link href="/story" className="font-medium text-tb-accent no-underline hover:underline">
              /story
            </Link>
            .
          </p>
        </div>

        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {[
            { t: "Streaming timeline", d: "Shape-of-run zoom + timed replay" },
            { t: "Risk-tiered approvals", d: "XState HITL + keyboard modal" },
            { t: "Audit log", d: "Human + agent decisions, immutable trail" },
            { t: "Cost / latency rail", d: "uPlot sparklines · $ and p50/p95" },
            { t: "Eval / release gate", d: "mock-jev golden scorer" },
            { t: "⌘K command palette", d: "Jump to runs, evals, policy" },
          ].map((f) => (
            <Card key={f.t} padding={16} className="border-tb-border/80">
              <div className="mb-1.5 font-semibold">{f.t}</div>
              <div className="text-[13px] text-tb-text-muted">{f.d}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-sm uppercase tracking-wider text-tb-text-muted">OpsAgent tool catalog</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOOL_CATALOG.map((tool) => (
            <Card key={tool.name} padding={12} className="min-w-[180px]">
              <div className="mb-1.5 flex items-center gap-2">
                <code className="font-mono text-xs">{tool.name}</code>
                <Badge tone={tool.risk}>{tool.risk}</Badge>
              </div>
              <div className="text-xs text-tb-text-muted">{tool.description}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
