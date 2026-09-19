import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & product tour — Tracebench",
  description:
    "What Tracebench is, who it’s for, Demo Mode without API keys, and a captioned feature tour.",
};

const TOUR: Array<{ src: string; alt: string; caption: string; href?: string }> = [
  {
    src: "/help/01-landing.png",
    alt: "Tracebench landing overview",
    caption: "Landing — control-room overview with Demo Mode entry points.",
    href: "/",
  },
  {
    src: "/help/02-runs.png",
    alt: "Runs list",
    caption: "Runs — seeded OpsAgent sessions; filter by status for shareable recruiter links.",
    href: "/runs",
  },
  {
    src: "/help/03-run-detail.png",
    alt: "Run detail with timeline",
    caption: "Run detail — Replay streams the timeline; metrics rail shows cost / latency.",
    href: "/runs/run_live_approve",
  },
  {
    src: "/help/04-approval-modal.png",
    alt: "HITL approval modal",
    caption: "HITL — risk-tiered approval modal (Esc / ⌘Enter) writes to the audit log.",
    href: "/runs/run_live_approve",
  },
  {
    src: "/help/07-pipeline-a2a.png",
    alt: "Multi-agent pipeline with A2A logs",
    caption: "Multi-agent — Planner → Researcher → Executor; Logs filter a2a with agent pills.",
    href: "/runs/run_pipeline_ops",
  },
  {
    src: "/help/08-graph.png",
    alt: "Observe graph",
    caption: "Graph — read-only observe view from spawn / message / await / join events.",
    href: "/runs/run_pipeline_ops/graph",
  },
  {
    src: "/help/06-dashboards.png",
    alt: "Ops dashboards",
    caption: "Dashboards — DnD layout over fixture projections; KPI tiles deep-link into runs / evals.",
    href: "/dashboards",
  },
  {
    src: "/help/05-evals.png",
    alt: "Evals release gate",
    caption: "Evals — golden suite + mock-jev release gate (intentional expect-fail rows included).",
    href: "/evals",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Do I need API keys?",
    a: "No. Demo Mode defaults to AGENT_TRANSPORT=fixture, JEV_ADAPTER=mock, and EVAL_SCORER=mock-jev. You can click through every primary surface offline.",
  },
  {
    q: "Does Tracebench call a real LLM?",
    a: "Not in Demo Mode. Seeded fixtures stream a realistic timeline. Live adapters (Cloudflare agent worker, live Jev) are optional and off by default.",
  },
  {
    q: "What is Jev?",
    a: "Jev is the risk / policy scorer port. The default MockJevAdapter needs zero keys. Opt into live scoring with JEV_ADAPTER=live after configuring Vercel AI Gateway OIDC.",
  },
  {
    q: "How do approvals (HITL) work?",
    a: "Medium and high-risk tools pause the run in awaiting_approval. The modal traps focus, supports Esc / ⌘Enter, and appends approve/deny decisions to the immutable audit log.",
  },
  {
    q: "Demo Mode vs live transport?",
    a: "Demo Mode uses in-memory fixtures so e2e and recruiters never need keys. Set AGENT_TRANSPORT=cloudflare and CF_AGENT_URL to point the same UI at the Durable Object worker.",
  },
  {
    q: "Is Cloudflare required?",
    a: "No. The agent-worker app is optional. Fixture transport is the portfolio default and what pnpm demo:check expects.",
  },
  {
    q: "Where do dashboards get their data?",
    a: "Widgets read /api/runs and /api/evals — the same fixture projections as the rest of the app. Layout is a localStorage preference, not a second source of truth.",
  },
  {
    q: "What is A2A?",
    a: "Agent-to-agent messages on multi-agent runs (e.g. run_pipeline_ops). Filter Logs to a2a, use the sequence strip (Planner → Researcher → Executor), and open the observe graph.",
  },
  {
    q: "How do I run locally with zero keys?",
    a: "From the repo root: pnpm install && pnpm dev → http://localhost:3000. Open the live approval demo or /help/demo-mode for the 90s click path. pnpm demo:check verifies Demo Mode health.",
  },
  {
    q: "Are the /story business metrics real customer numbers?",
    a: "No. /story metrics are labeled illustrative / industry-informed for narrative. Product proof stays on fixture runs, evals, and health — not named customer case studies.",
  },
  {
    q: "Keyboard shortcuts?",
    a: "⌘K command palette, R replay, Esc close modal, ⌘Enter approve. On Logs: F toggles follow, / focuses search. See Help → Keyboard & density.",
  },
  {
    q: "Why do some evals fail on purpose?",
    a: "Rows tagged expect-fail are intentional regressions (senior signal). The release gate distinguishes expected fails from unexpected ones — see the Failure gallery article.",
  },
];

function Shot({
  src,
  alt,
  caption,
  href,
}: {
  src: string;
  alt: string;
  caption: string;
  href?: string;
}) {
  const img = (
    <figure className="m-0 overflow-hidden rounded-md border border-tb-border bg-tb-bg-elevated">
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={800}
        className="h-auto w-full"
        sizes="(max-width: 800px) 100vw, 720px"
      />
      <figcaption className="border-t border-tb-border px-3 py-2 text-[13px] text-tb-text-muted">
        {caption}
        {href ? (
          <>
            {" "}
            <Link href={href} className="text-tb-accent no-underline hover:underline">
              Open →
            </Link>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
  return img;
}

export default function FaqPage() {
  return (
    <article
      className="mx-auto max-w-[800px] px-6 pb-20"
      style={{ paddingTop: "var(--tb-pad-y)" }}
      data-testid="help-faq"
    >
      <Link
        href="/help"
        className="mb-4 inline-block text-[13px] text-tb-text-muted no-underline hover:text-tb-text"
      >
        ← Help hub
      </Link>

      <h1 className="m-0 text-[26px] tracking-tight">FAQ & product tour</h1>
      <p className="mt-2 text-[15px] text-tb-text-muted">
        Recruiter-friendly explainer. Screenshots are from Demo Mode fixtures — no API keys required.
      </p>

      <section className="mt-10">
        <h2 className="m-0 text-[18px] tracking-tight">What is Tracebench?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-tb-text">
          Tracebench is a <strong>HITL control room</strong> for tool-calling agents: replayable
          timelines, risk-tiered approvals, audit trails, evals as a release gate, multi-agent A2A
          logs, an observe graph, and ops dashboards — designed as a Senior FE / Agent Ops portfolio
          showpiece, not a general multi-agent OS.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-[18px] tracking-tight">Who is it for / why it exists</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-tb-text">
          Built for hiring managers and staff+ FE engineers evaluating judgment: event-sourced runs,
          honest failure gallery, keyboard/a11y, Demo Mode contract (fixtures only), and architecture
          write-ups. The product metaphor is an <em>ops board</em>, not a chat toy.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-[18px] tracking-tight">Core capabilities</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-tb-text">
          <li>
            <strong>HITL</strong> — awaiting_approval gates on medium/high-risk tools
          </li>
          <li>
            <strong>Jev gate</strong> — pluggable risk/policy scorer (mock by default)
          </li>
          <li>
            <strong>Timeline + Replay</strong> — event stream with shape-of-run overview
          </li>
          <li>
            <strong>Evals</strong> — golden suite + release gate CLI
          </li>
          <li>
            <strong>Multi-agent A2A</strong> — sequence strip, colored from→to pills, log filters
          </li>
          <li>
            <strong>Observe graph</strong> — spawn / message / await / join only
          </li>
          <li>
            <strong>Dashboards</strong> — DnD widgets over the same fixture projections
          </li>
          <li>
            <strong>Logs</strong> — derived levels with counts, follow, JSONL download
          </li>
          <li>
            <strong>Demo Mode</strong> — zero-key fixtures; header badge; demo:check
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-md border border-tb-success/40 bg-tb-success-soft/20 p-4">
        <h2 className="m-0 text-[16px] text-tb-text">How to run with zero keys</h2>
        <ol className="mb-0 mt-2 list-decimal space-y-1 pl-5 text-[13px] text-tb-text-muted">
          <li>
            <code className="font-mono text-[12px]">pnpm install && pnpm dev</code>
          </li>
          <li>
            Open{" "}
            <Link href="/runs/run_live_approve" className="text-tb-accent no-underline hover:underline">
              /runs/run_live_approve
            </Link>{" "}
            or follow{" "}
            <Link href="/help/demo-mode" className="text-tb-accent no-underline hover:underline">
              Demo mode — 90s path
            </Link>
          </li>
          <li>
            Optional: <code className="font-mono text-[12px]">pnpm demo:check</code> expects{" "}
            <code className="font-mono text-[12px]">demoMode.kind=demo</code>
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="m-0 text-[18px] tracking-tight">Feature tour</h2>
        <p className="mt-2 text-[14px] text-tb-text-muted">
          Captioned screenshots from the live Demo Mode UI — click through each surface.
        </p>
        <div className="mt-5 flex flex-col gap-6">
          {TOUR.map((t) => (
            <Shot key={t.src} {...t} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="m-0 text-[18px] tracking-tight">FAQ</h2>
        <dl className="mt-4 flex flex-col gap-5">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-md border border-tb-border bg-tb-bg-elevated p-4">
              <dt className="m-0 text-[14px] font-semibold text-tb-text">{item.q}</dt>
              <dd className="mb-0 mt-2 text-[13px] leading-relaxed text-tb-text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-[13px] text-tb-text-dim">
        More depth:{" "}
        <Link href="/help/demo-mode" className="text-tb-accent no-underline hover:underline">
          Demo mode
        </Link>
        ,{" "}
        <Link href="/help/hitl-jev" className="text-tb-accent no-underline hover:underline">
          HITL & Jev
        </Link>
        ,{" "}
        <Link href="/architecture" className="text-tb-accent no-underline hover:underline">
          Architecture
        </Link>
        .
      </p>
    </article>
  );
}
