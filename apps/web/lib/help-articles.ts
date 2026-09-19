export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "faq",
    title: "FAQ & product tour",
    summary: "What Tracebench is, zero-key Demo Mode, captioned UI screenshots.",
    body: [
      "See the full FAQ with screenshots at /help/faq.",
      "Demo Mode needs no API keys. Start with /runs/run_live_approve or the 90s demo-mode guide.",
    ],
  },
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Install, run locally, open the live approval demo.",
    body: [
      "Tracebench is a HITL control room for tool-calling agents. No API keys are required for the seeded OpsAgent demos.",
      "From the repo root: `pnpm install && pnpm dev` → http://localhost:3000. Open **Open live approval demo** or `/runs/run_live_approve`.",
      "Use ⌘K to jump between Runs, Evals, Policy, and Help. Density and nav collapse persist in localStorage.",
      "Optional: `pnpm eval` for the release gate CLI, `pnpm test:storybook` for component tests, `pnpm health` for readiness.",
    ],
  },
    {
    slug: "demo-mode",
    title: "Demo mode — 90s click path",
    summary: "Zero keys: fixtures + mock Jev. Seeded run IDs for every surface.",
    body: [
      "Defaults: AGENT_TRANSPORT=fixture, JEV_ADAPTER=mock, EVAL_SCORER=mock-jev. Header badge shows Demo mode.",
      "HITL: /runs/run_live_approve (Emergency ledger top-up) — Replay → Review → Approve/Deny.",
      "Statuses: run_pay_vendor_ok (succeeded), run_deploy_denied (denied), run_refund_fail (failed), run_eval_regress (cost regression).",
      "Multi-agent: /runs/run_pipeline_ops — children run_child_researcher + run_child_executor; Logs → a2a; open Graph.",
      "Evals /evals (~40 golden, mock-jev). Policy /policy. Boards /dashboards — widgets use fixture aggregates.",
      "Health: pnpm demo:check expects demoMode.kind=demo. Force 503 with /api/health?force=down.",
    ],
  },
  {
    slug: "anatomy-of-a-run",
    title: "Anatomy of a run",
    summary: "Timeline, shape-of-run, metrics rail, audit, and logs.",
    body: [
      "A run is an event-sourced OpsAgent session: thoughts → tool calls → approvals → outcome.",
      "The **timeline** is the hero — Replay streams events; Show all reveals the full history. Shape-of-run is a Canvas overview (not WebGL).",
      "The **metrics rail** shows cost, latency, tokens, and p50/p95. The **audit log** is the immutable human+agent trail.",
      "The **Logs** panel derives color-labeled lines from timeline, audit, and tool results. Download `.txt` for sharing.",
    ],
  },
  {
    slug: "hitl-jev",
    title: "HITL & Jev gate",
    summary: "Risk-tiered approvals and the Jev policy adapter.",
    body: [
      "Medium and high-risk tools request human approval before irreversible side effects (e.g. `execute_payment`).",
      "The approval modal traps focus, supports Esc / ⌘Enter, and appends decisions to the audit log via domain commands.",
      "Jev is the risk/policy scorer port: default `MockJevAdapter` (zero keys). Opt into live with `JEV_ADAPTER=live` after Vercel AI Gateway OIDC.",
      "Policy matrix lives at `/policy`. Escalations show up in decision microcopy (awaiting · burn · Jev escalated).",
    ],
  },
  {
    slug: "evals-release-gate",
    title: "Evals / release gate",
    summary: "Golden set, mock-jev scorer, pass/fail gate.",
    body: [
      "`/evals` shows the golden suite scored by mock-jev (default) or rules (`EVAL_SCORER=rules`).",
      "Intentional regressions are tagged `expect-fail`. The gate fails when unexpected failures remain.",
      "`pnpm eval` exits non-zero on gate fail — use it in CI. Storybook covers empty/pass scorecard states.",
      "Filter results via URL (`?result=pass|fail`) for shareable links.",
    ],
  },
  {
    slug: "failure-gallery",
    title: "Failure gallery",
    summary: "Intentional eval regressions and denied high-risk runs — senior signal.",
    body: [
      "Tracebench ships honest failures so recruiters see judgment, not a greenwashed demo.",
      "Eval expect-fail: open /evals and find rows tagged expect-fail (cost regression). Gate still documents intentional fails separately from unexpected ones.",
      "Denied run: open /runs and the denied high-risk fixture — timeline shows approval.denied; audit preserves the human decision.",
      "Health drill: curl '/api/health?force=down' returns HTTP 503 with status=down — readiness never lies with 200 + ok:false only.",
      "Demo Mode keeps these fixtures available offline. Live adapters are not required to inspect failures.",
    ],
  },
  {
    slug: "keyboard-density",
    title: "Keyboard & density",
    summary: "⌘K, shortcuts, comfortable vs dense.",
    body: [
      "⌘K / Ctrl+K opens the command palette. Esc closes modals and the palette; focus returns to the opener.",
      "Approval modal: Esc cancel · ⌘/Ctrl+Enter approve · Tab cycles. Replay / Show all have keyboard chips in the UI.",
      "Density toggle (Comfort / Dense) adjusts row and panel spacing via CSS variables; preference persists.",
      "Reduced-motion: skeletons stay static (no shimmer), Motion staggers disable, toasts stay calm.",
    ],
  },
  {
    slug: "business-story",
    title: "Why Tracebench (business story)",
    summary: "Cinematic /story narrative — control plane outcomes, illustrative metrics, Demo Mode.",
    body: [
      "Open /story for the full scroll narrative: blind spot → cost of ungoverned agents → Tracebench control plane → illustrative business outcomes → product proof → Demo Mode CTA.",
      "Metrics on that page are labeled illustrative / industry-informed — not Tracebench production claims or named customer case studies.",
      "Ops product entry stays at /. Prefer ⌘K → Why Tracebench / Business story, the landing CTA, Demo Mode panel, or the footer link.",
      "prefers-reduced-motion disables sticky scroll sync and count-up; layout stacks cleanly on mobile.",
    ],
  },
  {
    slug: "transports-health",
    title: "Transports & health",
    summary: "Fixture vs Cloudflare transport; readiness endpoint.",
    body: [
      "`AGENT_TRANSPORT=fixture` (default) uses in-memory seeded runs — e2e-safe, zero keys.",
      "`AGENT_TRANSPORT=cloudflare` + `CF_AGENT_URL` points at the Durable Object worker (`apps/agent-worker`).",
      "`GET /api/health` returns **503** when a critical check fails (not a lying 200). Force with `?force=down` or `HEALTH_FORCE_DOWN=1`.",
      "Checks report fixtures, agent transport mode, Jev mode, optional eval smoke and Cloudflare probe. See docs/testing.md.",
    ],
  },
];

export function getArticle(slug: string) {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
