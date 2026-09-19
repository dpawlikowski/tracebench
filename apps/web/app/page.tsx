import Link from "next/link";
import { Button } from "@tracebench/ui";
import { GrainOverlay } from "@/components/landing/GrainOverlay";
import { ControlPlaneAssembly } from "@/components/landing/ControlPlaneAssembly";
import { MagneticCta } from "@/components/landing/MagneticCta";
import { MaskReveal } from "@/components/landing/MaskReveal";
import { WorkFrame } from "@/components/landing/WorkFrame";
import { CapabilityCards, type Capability } from "@/components/landing/CapabilityCards";
import { ProofStrip, type ProofChip } from "@/components/landing/ProofStrip";

const PROOF: readonly ProofChip[] = [
  { k: "Demo Mode", v: "zero API keys", kind: "route", target: "/runs" },
  { k: "HITL", v: "risk-tiered gates", kind: "section", target: "landing-capabilities-section" },
  { k: "Evals", v: "mock-jev release gate", kind: "route", target: "/evals" },
] as const;

const CAPABILITIES: readonly Capability[] = [
  {
    t: "Timeline",
    d: "Shape-of-run spine with replay, scrub, and mono event truth — not a chat dump.",
    detail:
      "Every thought, tool call, and approval projects from an event log. Scrub the spine on the live demo run.",
    href: "/runs/run_live_approve",
    cta: "Open live timeline",
  },
  {
    t: "HITL",
    d: "XState approval modal for irreversible tools. Keyboard-first. Audit-ready.",
    detail:
      "High-risk wire_transfer pauses for a human. Esc denies, ⌘Enter approves — both append to audit.",
    href: "/runs/run_live_approve",
    cta: "Try an approval",
  },
  {
    t: "Eval gate",
    d: "Score before ship. Cost and latency sit beside the decision, not in a spreadsheet.",
    detail:
      "Golden-set scorecard with mock-jev. Promote only when the gate is green — or tag expect-fail.",
    href: "/evals",
    cta: "Open scorecard",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-tb-bg">
      <GrainOverlay />
      <div className="tb-grid-atmosphere" aria-hidden />

      {/* 1 · Hook */}
      <section className="relative z-[1] mx-auto grid max-w-[1180px] gap-10 px-6 pb-14 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pt-20">
        <div>
          <MaskReveal>
            <p className="tb-section-label m-0">Agent Ops Workbench</p>
          </MaskReveal>
          <MaskReveal delayMs={60}>
            <h1 className="tb-display mb-5 mt-4 max-w-[640px] text-[clamp(36px,5.5vw,64px)] text-tb-text">
              The control plane for agents that touch money.
            </h1>
          </MaskReveal>
          <MaskReveal delayMs={120}>
            <p className="mb-3 mt-0 max-w-[520px] text-[15px] leading-relaxed text-tb-text-muted">
              Tracebench is a HITL ops surface: timeline, risk-tiered approvals, audit, cost, and
              eval gates. Chat is secondary. Governance is the product.
            </p>
          </MaskReveal>
          <p
            className="mb-8 text-[13px] text-tb-text-dim tabular-nums"
            data-testid="landing-microcopy"
          >
            1 awaiting · $0.22 burn · Jev escalated 2
          </p>

          <div className="mb-10 flex flex-wrap gap-3" data-tour="landing-ctas">
            <MagneticCta>
              <Link href="/runs/run_live_approve" prefetch className="no-underline hover:no-underline">
                <Button variant="primary" size="lg">
                  Open live approval demo
                </Button>
              </Link>
            </MagneticCta>
            <Link href="/runs" prefetch className="no-underline hover:no-underline">
              <Button variant="secondary" size="lg">
                Browse runs
              </Button>
            </Link>
            <Link href="/story" prefetch className="no-underline hover:no-underline">
              <Button variant="ghost" size="lg" data-testid="landing-story-cta">
                Read the story
              </Button>
            </Link>
            <Link href="/help/faq" prefetch className="no-underline hover:no-underline">
              <Button variant="ghost" size="lg" data-testid="landing-faq-cta">
                FAQ & tour
              </Button>
            </Link>
          </div>

          {/* 5 · Trust strip (early) */}
          <ProofStrip items={PROOF} />
        </div>

        <MaskReveal delayMs={180} className="relative">
          <ControlPlaneAssembly interactive />
          <p className="mt-3 text-[12px] text-tb-text-dim">
            Click HITL, agents, or eval to inspect the plane — Replay reassembles.
          </p>
        </MaskReveal>
      </section>

      {/* Problem → solution contrast (Synapse-style) */}
      <section
        id="landing-contrast-section"
        className="relative z-[1] mx-auto max-w-[1180px] scroll-mt-20 px-6 pb-14"
        data-testid="landing-contrast"
      >
        <p className="tb-section-label mb-4">The gap</p>
        <div className="grid gap-px overflow-hidden rounded-lg border border-tb-border bg-tb-border md:grid-cols-2">
          <div className="bg-tb-bg-elevated p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-tb-danger" aria-hidden />
              <span className="text-[12px] font-medium tracking-tight text-tb-text-dim">
                Without a plane
              </span>
            </div>
            <h2 className="m-0 text-[18px] font-semibold tracking-tight text-tb-text">
              Chat transcripts as the ops surface
            </h2>
            <ul className="mt-4 mb-0 list-none space-y-2.5 p-0 text-[13px] leading-relaxed text-tb-text-muted">
              <li className="border-l-2 border-tb-danger/40 pl-3">
                Irreversible tools fire from prompts — no risk tier, no pause.
              </li>
              <li className="border-l-2 border-tb-danger/40 pl-3">
                Burn and latency hide in invoices and APM, not beside the call.
              </li>
              <li className="border-l-2 border-tb-danger/40 pl-3">
                Audit = Slack archaeology when something goes wrong.
              </li>
            </ul>
          </div>
          <div className="bg-tb-bg-elevated p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-tb-accent" aria-hidden />
              <span className="text-[12px] font-medium tracking-tight text-tb-text-dim">
                With Tracebench
              </span>
            </div>
            <h2 className="m-0 text-[18px] font-semibold tracking-tight text-tb-text">
              A HITL control plane
            </h2>
            <ul className="mt-4 mb-0 list-none space-y-2.5 p-0 text-[13px] leading-relaxed text-tb-text-muted">
              <li className="border-l-2 border-tb-accent/50 pl-3">
                Timeline spine + risk-tiered approvals for money and config.
              </li>
              <li className="border-l-2 border-tb-accent/50 pl-3">
                Cost and eval gates sit in the same instrument as the run.
              </li>
              <li className="border-l-2 border-tb-accent/50 pl-3">
                Event log + audit trail — evidence is structured by default.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="landing-capabilities-section"
        className="relative z-[1] mx-auto max-w-[1180px] scroll-mt-20 px-6 pb-14"
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="tb-section-label m-0">Capabilities</p>
            <p className="mb-0 mt-1 max-w-[420px] text-[13px] text-tb-text-muted">
              Expand a tile to learn the surface, then jump into Demo Mode.
            </p>
          </div>
          <div className="h-px flex-1 bg-tb-border tb-hairline-sweep" aria-hidden />
        </div>
        <CapabilityCards items={CAPABILITIES} />
      </section>

      {/* Product proof — before/after workbench */}
      <section
        id="landing-workbench-section"
        className="relative z-[1] mx-auto max-w-[1180px] scroll-mt-20 px-6 pb-14"
      >
        <p className="tb-section-label mb-2">In the workbench</p>
        <p className="mb-4 max-w-[480px] text-[13px] text-tb-text-muted">
          Scrub left/right (or click) to compare ungoverned chaos with a HITL-gated run.
        </p>
        <WorkFrame />
      </section>

      {/* Handoff to story + CTA */}
      <section className="relative z-[1] mx-auto max-w-[1180px] px-6 pb-24">
        <div
          className="mb-8 rounded-lg border border-tb-border bg-tb-bg-elevated p-5 transition-colors hover:border-tb-border-strong"
          data-testid="landing-story-teaser"
        >
          <div className="mb-1 text-sm font-semibold tracking-tight text-tb-text">
            Why Tracebench
          </div>
          <p className="m-0 mb-3 max-w-[560px] text-[13px] leading-relaxed text-tb-text-muted">
            A cinematic case study: ungoverned agents → control plane → illustrative outcomes →
            Demo Mode. Ops density stays in the app; the narrative lives on{" "}
            <Link href="/story" className="font-medium text-tb-accent no-underline hover:underline">
              /story
            </Link>
            .
          </p>
          <MagneticCta>
            <Link href="/story" className="no-underline hover:no-underline">
              <Button variant="secondary" size="md" data-testid="landing-story-teaser-cta">
                Enter the story →
              </Button>
            </Link>
          </MagneticCta>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-tb-border bg-tb-bg-elevated p-6 sm:flex-row sm:items-center">
          <div>
            <p className="tb-section-label m-0">Start in Demo Mode</p>
            <h2 className="tb-display m-0 mt-2 text-[clamp(22px,3vw,32px)]">
              Zero keys. Seeded HITL. Ninety seconds.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <MagneticCta>
              <Link href="/runs/run_live_approve" className="no-underline hover:no-underline">
                <Button variant="primary" size="lg">
                  Open demo run
                </Button>
              </Link>
            </MagneticCta>
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
          </div>
        </div>
      </section>
    </div>
  );
}
