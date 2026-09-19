/** Narrative copy + illustrative metrics for /story. Numbers are labeled illustrative. */

export const STORY_SECTIONS = [
  { id: "hero", label: "Outcome" },
  { id: "blind-spot", label: "Blind spot" },
  { id: "what-breaks", label: "What breaks" },
  { id: "answer", label: "Answer" },
  { id: "outcomes", label: "Outcomes" },
  { id: "how-teams", label: "How teams work" },
  { id: "proof", label: "Proof" },
  { id: "cta", label: "Start" },
] as const;

export type StorySectionId = (typeof STORY_SECTIONS)[number]["id"];

export const ILLUSTRATIVE_FOOTNOTE =
  "Illustrative / industry-informed estimates for narrative context — not Tracebench production claims or customer results.";

export const METRICS = [
  {
    id: "hitl",
    value: 56,
    suffix: "%",
    range: "~45–67%",
    label: "Fewer high-severity incidents",
    detail:
      "Risk-adaptive HITL vs universal review — modeled industry research style: escalate irreversible tools, auto-pass low risk.",
    definition:
      "In Tracebench: Jev risk tiers pause only medium/high tools. Low-risk flows; irreversible work waits for a human.",
  },
  {
    id: "overhead",
    value: 26,
    suffix: "%",
    range: "18–35%",
    label: "Governance overhead without tooling",
    detail:
      "Share of agent spend burned on ad-hoc review, screenshots, and Slack archaeology when there is no control plane.",
    definition:
      "In Tracebench: the timeline + audit trail replaces screenshot archaeology — evidence is already structured.",
  },
  {
    id: "audit",
    value: 40,
    suffix: "×",
    range: "weeks → hours",
    label: "Faster audit prep",
    detail:
      "Event log + approval trail turns evidence gathering from multi-week fire drills into hour-scale exports.",
    definition:
      "In Tracebench: every approve/deny and tool arg lands in the event log — reconstruct intent without Slack digs.",
  },
  {
    id: "burn",
    value: 1,
    prefix: "<",
    suffix: "h",
    range: "before $ burn",
    label: "Catch runaway tool loops",
    detail:
      "Cost / latency rail surfaces loops and token spikes while the run is still live — not after the invoice.",
    definition:
      "In Tracebench: the metrics rail sits beside the timeline so burn is a first-class ops signal, not a month-end surprise.",
  },
  {
    id: "evals",
    value: 1,
    suffix: " gate",
    range: "pre-ship",
    label: "Release confidence",
    detail:
      "Eval gate catches cost and behavior regressions on a golden set before you promote an agent change.",
    definition:
      "In Tracebench: /evals mock-jev scorecard gates promote. Expect-fail tags keep intentional fails documented.",
  },
] as const;

export const BREAKS = [
  {
    id: "cost",
    title: "Cost without a ceiling",
    body: "Tool loops and retries silently compound. Without a live burn rail, finance learns about agents from the card statement.",
    deep: "Open a demo run and watch the cost rail update beside each tool call. The point is not a prettier chart — it is catching a loop before the invoice.",
    href: "/runs/run_live_approve",
  },
  {
    id: "latency",
    title: "Latency as a product risk",
    body: "p95 spikes hide in chat transcripts. Ops needs percentiles next to the timeline — not buried in provider dashboards.",
    deep: "Latency lives on the same spine as thoughts and tools. When p95 moves, operators see it in context of the step that caused it.",
    href: "/runs/run_live_approve",
  },
  {
    id: "tools",
    title: "Irreversible tools, reversible trust",
    body: "Payments, deploys, and writes need a human gate. Universal review is too slow; no review is too expensive.",
    deep: "Jev risk policy decides who pauses. High-risk wire_transfer opens the HITL modal; low-risk tools keep flowing.",
    href: "/runs/run_live_approve",
  },
  {
    id: "audit",
    title: "No audit, no defense",
    body: "When something goes wrong, screenshots and Slack threads are not an evidence plane. You need an immutable event trail.",
    deep: "Approvals and denials append to the event log with args and actor. Audit prep becomes export, not archaeology.",
    href: "/help/demo-mode",
  },
] as const;

export const ANSWER_PILLARS = [
  {
    id: "event-log",
    title: "Event log",
    body: "Runs are event-sourced. The timeline is a projection — truth lives in the log.",
    deep: "Shape-of-run and the event list never invent state. If it is not in the log, it did not happen — that is the contract for nested agents too.",
  },
  {
    id: "jev",
    title: "Jev gate",
    body: "Risk policy decides who pauses: low tools flow; medium/high escalate to HITL.",
    deep: "Policy is inspectable at /policy. Demo Mode uses mock-jev so you can see escalations without wiring a real scorer.",
  },
  {
    id: "hitl",
    title: "HITL approvals",
    body: "Keyboard-first modal, focus trap, audit-backed approve / deny on irreversible tools.",
    deep: "Try the live approval demo: review args, Esc to deny, ⌘Enter to approve. Both paths write an audit row.",
  },
  {
    id: "evals",
    title: "Eval release gate",
    body: "Golden set + mock-jev scorer. Ship when the gate is green — or document intentional fails.",
    deep: "The /evals scorecard is the promote decision. Expect-fail tags keep known bad cases from looking like regressions.",
  },
  {
    id: "a2a",
    title: "A2A / nested agents",
    body: "Parent–child runs and AgentMessage events — observe graph never invents edges.",
    deep: "Open a nested pipeline run: children and A2A messages appear only from events — the graph is a projection, not a fiction.",
  },
  {
    id: "ops",
    title: "Ops boards",
    body: "Aggregates for awaiting, burn, and escalations — the control room wall, not another chat.",
    deep: "/ops and /dashboards surface awaiting approvals and burn so the on-call wall matches the timeline truth.",
  },
] as const;

export const PRODUCT_FRAMES = [
  {
    src: "/story/03-run-detail.png",
    alt: "Run detail with streaming timeline and metrics rail",
    caption: "Timeline hero — thoughts, tools, approvals, cost rail",
    chapter: "Replay the shape of a run before you trust the outcome.",
    href: "/runs/run_live_approve",
    routeLabel: "Open live run",
  },
  {
    src: "/story/04-approval-modal.png",
    alt: "High-risk approval modal for execute_payment",
    caption: "HITL gate — review args, Esc / ⌘Enter, audit append",
    chapter: "Irreversible tools wait for a human. Everything else keeps moving.",
    href: "/runs/run_live_approve",
    routeLabel: "Try approval demo",
  },
  {
    src: "/story/02-runs.png",
    alt: "Runs list with status filters",
    caption: "Fleet view — awaiting, denied, succeeded, failed",
    chapter: "Operators jump from microcopy to the run that needs a decision.",
    href: "/runs",
    routeLabel: "Browse runs",
  },
  {
    src: "/story/05-evals.png",
    alt: "Eval release gate scorecard",
    caption: "Release gate — golden set, pass/fail, expect-fail tags",
    chapter: "Promote agent changes only when the scorecard agrees.",
    href: "/evals",
    routeLabel: "Open evals",
  },
  {
    src: "/story/07-pipeline-a2a.png",
    alt: "Multi-agent pipeline with A2A messages",
    caption: "Nested agents — researcher + executor, A2A on the graph",
    chapter: "Multi-agent work stays inspectable: messages, children, edges from events.",
    href: "/runs",
    routeLabel: "Explore runs",
  },
] as const;

/** Closing chapter (#story-cta / rail "Start") — next steps after the narrative. */
export const CTA_NEXT_STEPS = [
  {
    id: "demo",
    title: "Live approval demo",
    purpose: "Hit a high-risk tool gate in Demo Mode — Esc deny, ⌘Enter approve, audit append.",
    href: "/runs/run_live_approve",
    cta: "Open demo",
    testId: "story-cta-demo",
    primary: true,
  },
  {
    id: "help",
    title: "FAQ & 90s path",
    purpose: "What Tracebench is, zero-key Demo Mode, and a captioned click path.",
    href: "/help",
    cta: "Open help",
    testId: "story-cta-help",
    primary: false,
  },
  {
    id: "architecture",
    title: "Architecture",
    purpose: "Event log as truth, HITL commands, nested agents — how the plane is wired.",
    href: "/architecture",
    cta: "Read architecture",
    testId: "story-cta-arch",
    primary: false,
  },
] as const;

export const CTA_JOURNEY = [
  { n: "01", label: "Blind spot" },
  { n: "02", label: "What breaks" },
  { n: "03", label: "Control plane" },
  { n: "04", label: "Outcomes" },
  { n: "05", label: "Demo Mode" },
] as const;
