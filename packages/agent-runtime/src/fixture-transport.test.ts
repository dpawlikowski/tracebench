import { describe, it, expect, beforeEach } from "vitest";
import { FixtureAgentTransport } from "./fixture-transport";

describe("FixtureAgentTransport", () => {
  let transport: FixtureAgentTransport;

  beforeEach(() => {
    transport = new FixtureAgentTransport();
  });

  it("lists seeded runs", async () => {
    const runs = await transport.listRuns();
    expect(runs.length).toBeGreaterThanOrEqual(5);
    expect(runs.some((r) => r.id === "run_live_approve")).toBe(true);
  });

  it("approve path settles via domain", async () => {
    const updated = await transport.decideApproval({
      runId: "run_live_approve",
      approvalId: "ap_lv_2",
      decision: "approved",
      decidedBy: "tester",
    });
    expect(updated?.status).toBe("succeeded");
    expect(updated?.approvals.find((a) => a.id === "ap_lv_2")?.status).toBe("approved");
  });

  it("subscribe returns SSE content-type", async () => {
    const res = await transport.subscribe("run_live_approve", { speed: 100 });
    expect(res.ok).toBe(true);
    expect(res.headers.get("Content-Type")).toMatch(/text\/event-stream/);
    // Drain quickly (speed=100 collapses delays)
    await res.text();
  });
});
