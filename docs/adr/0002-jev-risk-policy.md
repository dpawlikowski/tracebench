# ADR 0002 — Jev-backed tool risk policy (mock-first)

- **Status:** Accepted
- **Date:** 2026-09-19

## Context

Tracebench gates irreversible OpsAgent tools with HITL. Static catalog flags (`risk`, `irreversible`, `requiresApproval`) are necessary but blunt — they cannot express “this particular call looks routine” vs “ambiguous / elevated”.

TypeSafe **Jev** (via AI SDK `experimental_evaluate`, model `typesafe-ai/jev`) returns typed `choice` / `boolean` / `score` answers with calibrated probabilities and, for choice/score, confidence in `providerMetadata.typesafe.confidence`.

Live Jev requires Vercel AI Gateway OIDC (`vercel env pull`). Portfolio Demo Mode must stay **zero-key** (`JEV_ADAPTER=mock` default; no multi-tenant/auth).

## Decision

1. Introduce a `JevAdapter` port with two adapters:
   - **`MockJevAdapter` (DEFAULT)** — deterministic answers from catalog risk; no network.
   - **`LiveJevAdapter` (optional)** — `experimental_evaluate({ model: "typesafe-ai/jev", ... })`; opt-in via `JEV_ADAPTER=live`.
2. Ask three atomic questions (`riskTier` choice, `safeToAutoAllow` boolean, `severity` score) and combine them in pure domain logic `decideToolGate`.
3. Policy: **high confidence + low risk → `auto_allow`; else `escalate_hitl`**. Catalog high-risk / irreversible tools never auto-allow. Live evaluation errors **fail closed** (`deny`) for high-risk / irreversible tools; escalate for medium.
4. Unit-test branching with `Experimental_EvaluationMockModelV4` from `ai/test` (no Gateway).

## Consequences

- Demo / CI / Playwright stay keyless via mock adapter.
- Live path is a thin swap behind the same port when OIDC is present.
- Risk policy matrix UI (`/policy`) makes the gate visible for interview talk-track.

---

## Addendum — Eval / release scorer (2026-09-19)

The same `JevAdapter` port also scores golden cases for the release gate:

1. Questions: `policy_ok` (boolean), `faithfulness_proxy` (score), `cost_anomaly` (boolean).
2. Default path: **mock-jev** via `MockJevAdapter.evaluateGoldenCase` (zero-key; aligned with rule checks).
3. Opt-in: `JEV_ADAPTER=live` → `live-jev`; escape hatch `EVAL_SCORER=rules`.
4. Results tagged `scorerSource`; see `docs/jev.md`.

HITL `decideToolGate` / tool-risk questions are unchanged.
