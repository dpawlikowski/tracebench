# Jev in Tracebench

**As of 2026-09-20.** Portfolio Demo Mode also sets `AGENT_TRANSPORT=fixture`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`.

TypeSafe **Jev** (AI SDK `experimental_evaluate`, model `typesafe-ai/jev`) powers two surfaces behind one `JevAdapter` port:

| Surface | Questions | Where |
|--------|-----------|--------|
| **HITL tool gate** | `riskTier`, `safeToAutoAllow`, `severity` | `decideToolGate` · `/policy` · ADR 0002 |
| **Eval / release scorer** | `policy_ok`, `faithfulness_proxy`, `cost_anomaly` | `packages/evals` · `/evals` · `pnpm eval` |

Portfolio Demo Mode default: **`JEV_ADAPTER=mock`** — zero keys, no OIDC, no multi-tenant/auth.

## Adapters (mock-first)

- **`MockJevAdapter` (DEFAULT)** — deterministic, zero keys / no OIDC. Demo + CI.
- **`LiveJevAdapter`** — opt-in via `JEV_ADAPTER=live` after `vercel link && vercel env pull`.

Factory: `createJevAdapter()` in `@tracebench/agent-runtime`.

## Eval scorer

Default suite path is **mock-jev** (not the legacy rules scorer). `EVAL_SCORER=mock-jev`.

```bash
pnpm eval                       # mock-jev (default) — gate PASS with expect-fail cost regressions
EVAL_SCORER=rules pnpm eval     # legacy heuristic scorer
JEV_ADAPTER=live pnpm eval      # live-jev (needs AI Gateway OIDC)
```

Results are tagged `scorerSource: "rules" | "mock-jev" | "live-jev"`. The `/evals` UI shows the suite source and light Jev probabilities (P(ok), faith, cost↑).

**Policy (eval):** fail if `P(policy_ok) < 0.5`, or `P(cost_anomaly) ≥ 0.5`, or `faithfulness_proxy < 1.5` (0..3 rubric). Mock answers are calibrated from the same checks as the rules scorer so intentional `expect-fail` cost cases still fail while the release gate stays green.

HITL gate is unchanged — Jev is **not** wired into chat / `domain.reduce`.
