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
  },
  {
    id: "overhead",
    value: 26,
    suffix: "%",
    range: "18–35%",
    label: "Governance overhead without tooling",
    detail:
      "Share of agent spend burned on ad-hoc review, screenshots, and Slack archaeology when there is no control plane.",
  },
  {
    id: "audit",
    value: 40,
    suffix: "×",
    range: "weeks → hours",
    label: "Faster audit prep",
    detail:
      "Event log + approval trail turns evidence gathering from multi-week fire drills into hour-scale exports.",
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
  },
  {
    id: "evals",
    value: 1,
    suffix: " gate",
    range: "pre-ship",
    label: "Release confidence",
    detail:
      "Eval gate catches cost and behavior regressions on a golden set before you promote an agent change.",
  },
] as const;

export const BREAKS = [
  {
    title: "Cost without a ceiling",
    body: "Tool loops and retries silently compound. Without a live burn rail, finance learns about agents from the card statement.",
  },
  {
    title: "Latency as a product risk",
    body: "p95 spikes hide in chat transcripts. Ops needs percentiles next to the timeline — not buried in provider dashboards.",
  },
  {
    title: "Irreversible tools, reversible trust",
    body: "Payments, deploys, and writes need a human gate. Universal review is too slow; no review is too expensive.",
  },
  {
    title: "No audit, no defense",
    body: "When something goes wrong, screenshots and Slack threads are not an evidence plane. You need an immutable event trail.",
  },
] as const;

export const ANSWER_PILLARS = [
  {
    title: "Event log",
    body: "Runs are event-sourced. The timeline is a projection — truth lives in the log.",
  },
  {
    title: "Jev gate",
    body: "Risk policy decides who pauses: low tools flow; medium/high escalate to HITL.",
  },
  {
    title: "HITL approvals",
    body: "Keyboard-first modal, focus trap, audit-backed approve / deny on irreversible tools.",
  },
  {
    title: "Eval release gate",
    body: "Golden set + mock-jev scorer. Ship when the gate is green — or document intentional fails.",
  },
  {
    title: "A2A / nested agents",
    body: "Parent–child runs and AgentMessage events — observe graph never invents edges.",
  },
  {
    title: "Ops boards",
    body: "Aggregates for awaiting, burn, and escalations — the control room wall, not another chat.",
  },
] as const;

export const PRODUCT_FRAMES = [
  {
    src: "/story/03-run-detail.png",
    alt: "Run detail with streaming timeline and metrics rail",
    caption: "Timeline hero — thoughts, tools, approvals, cost rail",
    chapter: "Replay the shape of a run before you trust the outcome.",
  },
  {
    src: "/story/04-approval-modal.png",
    alt: "High-risk approval modal for execute_payment",
    caption: "HITL gate — review args, Esc / ⌘Enter, audit append",
    chapter: "Irreversible tools wait for a human. Everything else keeps moving.",
  },
  {
    src: "/story/02-runs.png",
    alt: "Runs list with status filters",
    caption: "Fleet view — awaiting, denied, succeeded, failed",
    chapter: "Operators jump from microcopy to the run that needs a decision.",
  },
  {
    src: "/story/05-evals.png",
    alt: "Eval release gate scorecard",
    caption: "Release gate — golden set, pass/fail, expect-fail tags",
    chapter: "Promote agent changes only when the scorecard agrees.",
  },
  {
    src: "/story/07-pipeline-a2a.png",
    alt: "Multi-agent pipeline with A2A messages",
    caption: "Nested agents — researcher + executor, A2A on the graph",
    chapter: "Multi-agent work stays inspectable: messages, children, edges from events.",
  },
] as const;
