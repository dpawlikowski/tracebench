import Link from "next/link";
import { Button, Badge } from "@tracebench/ui";
import { GrainOverlay } from "@/components/landing/GrainOverlay";
import { ControlPlaneAssembly } from "@/components/landing/ControlPlaneAssembly";
import { MagneticCta } from "@/components/landing/MagneticCta";
import { MaskReveal } from "@/components/landing/MaskReveal";
import { WorkFrame } from "@/components/landing/WorkFrame";

const PROOF = [
  { k: "Demo Mode", v: "zero API keys" },
  { k: "HITL", v: "risk-tiered gates" },
  { k: "Evals", v: "mock-jev release gate" },
] as const;

const CAPABILITIES = [
  {
    t: "Timeline",
    d: "Shape-of-run spine with replay, scrub, and mono event truth — not a chat dump.",
  },
  {
    t: "HITL",
    d: "XState approval modal for irreversible tools. Keyboard-first. Audit-ready.",
  },
  {
    t: "Eval gate",
    d: "Score before ship. Cost and latency sit beside the decision, not in a spreadsheet.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-tb-bg">
      <GrainOverlay />
      <div className="tb-grid-atmosphere" aria-hidden />

      {/* Hero */}
      <section className="relative z-[1] mx-auto grid max-w-[1180px] gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pt-20">
        <div>
          <MaskReveal>
            <p className="tb-section-label m-0 text-tb-accent">Agent Ops Workbench</p>
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
            className="mb-8 font-mono text-[13px] text-tb-text-dim tabular-nums"
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

          {/* Proof strip */}
          <div className="flex flex-wrap gap-2" data-testid="landing-proof-strip">
            {PROOF.map((p) => (
              <span
                key={p.k}
                className="inline-flex items-center gap-2 rounded-sm border border-tb-border bg-tb-bg-elevated px-2.5 py-1.5 font-mono text-[11px] text-tb-text-muted"
              >
                <span className="text-tb-accent">{p.k}</span>
                <span className="text-tb-text-dim">·</span>
                <span>{p.v}</span>
              </span>
            ))}
          </div>
        </div>

        <MaskReveal delayMs={180} className="relative">
          <ControlPlaneAssembly />
        </MaskReveal>
      </section>

      {/* Capability tiles — shared-edge */}
      <section className="relative z-[1] mx-auto max-w-[1180px] px-6 pb-16">
        <div className="mb-4 flex items-end justify-between gap-4">
          <p className="tb-section-label m-0">Capabilities</p>
          <div className="h-px flex-1 bg-tb-border tb-hairline-sweep" aria-hidden />
        </div>
        <div className="tb-tile-grid grid-cols-1 sm:grid-cols-3" data-testid="landing-capabilities">
          {CAPABILITIES.map((c) => (
            <div key={c.t} className="p-5 transition-colors duration-150 hover:bg-tb-bg-hover">
              <h2 className="m-0 text-[15px] font-semibold tracking-tight">{c.t}</h2>
              <p className="mb-0 mt-2 text-[13px] leading-relaxed text-tb-text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Work frame */}
      <section className="relative z-[1] mx-auto max-w-[1180px] px-6 pb-16">
        <p className="tb-section-label mb-4">In the workbench</p>
        <WorkFrame>
          <div className="border-b border-tb-border bg-tb-bg px-4 py-2.5 font-mono text-[11px] text-tb-text-dim">
            run_live_approve · awaiting_approval · wire_transfer
          </div>
          <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2 border-b border-tb-border p-4 md:border-b-0 md:border-r">
              {[
                { t: "thought", c: "Verify beneficiary + amount against policy" },
                { t: "tool", c: "wire_transfer · $12,400 · high risk" },
                { t: "approval", c: "HITL gate · Jev escalated" },
              ].map((row) => (
                <div
                  key={row.t}
                  className="flex items-start gap-3 rounded-sm border border-tb-border bg-tb-bg-sunken px-3 py-2"
                >
                  <Badge tone={row.t === "approval" ? "warning" : row.t === "tool" ? "accent" : "neutral"}>
                    {row.t}
                  </Badge>
                  <span className="font-mono text-[12px] text-tb-text-muted">{row.c}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-tb-text-dim">
                Cost / latency
              </div>
              <div className="font-mono text-[28px] font-semibold tracking-tight tabular-nums">
                $0.22
              </div>
              <div className="h-10 rounded-sm border border-dashed border-tb-border bg-tb-accent-soft/40" />
              <div className="text-[12px] text-tb-text-muted">
                Phosphor instrument chrome — dense ops, calm decisions.
              </div>
            </div>
          </div>
        </WorkFrame>
      </section>

      {/* Story teaser + CTA band */}
      <section className="relative z-[1] mx-auto max-w-[1180px] px-6 pb-24">
        <div
          className="mb-8 rounded-md border border-tb-border bg-tb-bg-elevated p-5"
          data-testid="landing-story-teaser"
        >
          <div className="mb-1 text-sm font-semibold tracking-tight text-tb-text">Why Tracebench</div>
          <p className="m-0 mb-2 max-w-[560px] text-[13px] leading-relaxed text-tb-text-muted">
            A cinematic business narrative: ungoverned agents → control plane → illustrative
            outcomes → Demo Mode. Ops routes stay here; the story lives at{" "}
            <Link href="/story" className="font-medium text-tb-accent no-underline hover:underline">
              /story
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border border-tb-border bg-tb-bg-elevated p-6 sm:flex-row sm:items-center">
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
