/**
 * Contract tests — fetch against MSW handlers; Zod schemas validate
 * request/response shapes. Shared handlers also power Storybook.
 *
 * Why Zod+MSW (not Pact): Tracebench is a single-repo portfolio MVP with
 * fixture Demo Mode. Schemas already are the contract; MSW reuses them for
 * Storybook + Vitest without a broker or consumer/provider CI matrix.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ApprovalRequestSchema,
  ApproveResponseSchema,
  EvalsResponseSchema,
  HealthResponseSchema,
  RunDetailResponseSchema,
  RunsListResponseSchema,
} from "@tracebench/schemas";
import { server } from "../../mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API contracts (MSW + Zod)", () => {
  it("GET /api/runs → RunsListResponseSchema", async () => {
    const res = await fetch("http://localhost/api/runs");
    expect(res.status).toBe(200);
    const body = RunsListResponseSchema.parse(await res.json());
    expect(body.runs.length).toBeGreaterThan(0);
    expect(body.runs.some((r) => r.id === "run_live_approve")).toBe(true);
  });

  it("GET /api/runs/:id → RunDetailResponseSchema", async () => {
    const res = await fetch("http://localhost/api/runs/run_live_approve");
    expect(res.status).toBe(200);
    const body = RunDetailResponseSchema.parse(await res.json());
    expect(body.run.id).toBe("run_live_approve");
    expect(body.run.timeline.length).toBeGreaterThan(0);
  });

  it("GET /api/runs/:id 404 for unknown", async () => {
    const res = await fetch("http://localhost/api/runs/does_not_exist");
    expect(res.status).toBe(404);
  });

  it("POST /api/runs/:id/approve validates body + returns run", async () => {
    const detail = await fetch("http://localhost/api/runs/run_live_approve").then(
      (r) => r.json(),
    );
    const pending = detail.run.approvals.find(
      (a: { status: string }) => a.status === "pending",
    );
    expect(pending).toBeTruthy();

    const payload = ApprovalRequestSchema.parse({
      approvalId: pending.id,
      decision: "approved",
      note: "contract-test",
    });

    const res = await fetch("http://localhost/api/runs/run_live_approve/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(200);
    const body = ApproveResponseSchema.parse(await res.json());
    expect(body.run.status).toBe("succeeded");
  });

  it("POST /api/runs/:id/approve 400 on invalid body", async () => {
    const res = await fetch("http://localhost/api/runs/run_live_approve/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "maybe" }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/evals → EvalsResponseSchema", async () => {
    const res = await fetch("http://localhost/api/evals");
    expect(res.status).toBe(200);
    const body = EvalsResponseSchema.parse(await res.json());
    expect(body.report.gate).toBe("pass");
    expect(body.cases.length).toBeGreaterThan(0);
  });

  it("GET /api/health → HealthResponseSchema (demo)", async () => {
    const res = await fetch("http://localhost/api/health");
    expect(res.status).toBe(200);
    const body = HealthResponseSchema.parse(await res.json());
    expect(body.status).toBe("ok");
    expect(body.demoMode?.kind).toBe("demo");
    expect(body.checks.agentTransport.mode).toBe("fixture");
  });
});
