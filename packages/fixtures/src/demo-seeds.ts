/**
 * Canonical Demo Mode seeded IDs — keep in sync with DEMO_SCRIPT + /help/demo-mode.
 * All surfaces resolve these with AGENT_TRANSPORT=fixture (default).
 */
export const DEMO_SEEDS = {
  hitl: {
    id: "run_live_approve",
    title: "Emergency ledger top-up",
    why: "Pending high-risk execute_payment — primary HITL path",
  },
  multiAgentParent: {
    id: "run_pipeline_ops",
    title: "Multi-agent ops remittance",
    why: "Planner → Researcher → Executor with A2A + graph",
  },
  multiAgentChildren: [
    { id: "run_child_researcher", title: "Research ACME payment policy" },
    { id: "run_child_executor", title: "Execute ACME remittance" },
  ],
  succeeded: {
    id: "run_pay_vendor_ok",
    title: "Pay ACME invoice #4821",
    why: "Happy path with approvals completed",
  },
  denied: {
    id: "run_deploy_denied",
    title: "Hotfix routing config",
    why: "Human denied high-risk deploy — audit trail",
  },
  failed: {
    id: "run_refund_fail",
    title: "Process customer refund batch",
    why: "Tool failure mid-run",
  },
  evalRegression: {
    id: "run_eval_regress",
    title: "Bulk vendor payouts (regression candidate)",
    why: "Feeds expect-fail golden cost cases",
  },
} as const;

export const DEMO_SEED_IDS = [
  DEMO_SEEDS.hitl.id,
  DEMO_SEEDS.multiAgentParent.id,
  ...DEMO_SEEDS.multiAgentChildren.map((c) => c.id),
  DEMO_SEEDS.succeeded.id,
  DEMO_SEEDS.denied.id,
  DEMO_SEEDS.failed.id,
  DEMO_SEEDS.evalRegression.id,
] as const;
