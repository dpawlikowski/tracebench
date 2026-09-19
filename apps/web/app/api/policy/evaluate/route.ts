import { NextResponse } from "next/server";
import { TOOL_CATALOG } from "@tracebench/fixtures";
import {
  createJevAdapter,
  evaluateToolPolicy,
} from "@tracebench/agent-runtime";
import { ToolPolicyInputSchema } from "@tracebench/schemas";

export const dynamic = "force-dynamic";

/**
 * POST — evaluate a single proposed tool call (body: ToolPolicyInput).
 * GET  — matrix over the whole TOOL_CATALOG (mock Jev by default).
 *
 * Live Jev is opt-in via JEV_ADAPTER=live + AI Gateway OIDC (`vercel env pull`).
 */
export async function GET() {
  const adapter = createJevAdapter();
  const rows = await Promise.all(
    TOOL_CATALOG.map(async (tool) => {
      const input = ToolPolicyInputSchema.parse({
        toolName: tool.name,
        catalogRisk: tool.risk,
        irreversible: tool.irreversible,
        args: {},
        runGoal: "Policy matrix catalog scan",
      });
      const { decision, evaluationSource } = await evaluateToolPolicy(input, adapter);
      return {
        tool: {
          name: tool.name,
          description: tool.description,
          risk: tool.risk,
          irreversible: tool.irreversible,
          requiresApproval: tool.requiresApproval,
          category: tool.category,
        },
        decision,
        evaluationSource,
      };
    }),
  );

  return NextResponse.json({
    adapter: adapter.kind,
    thresholds: {
      policy:
        "high confidence + low risk → auto_allow; else escalate_hitl; live errors fail-closed for high-risk",
    },
    rows,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ToolPolicyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid ToolPolicyInput", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const adapter = createJevAdapter();
  const { decision, evaluationSource } = await evaluateToolPolicy(parsed.data, adapter);
  return NextResponse.json({ decision, evaluationSource, adapter: adapter.kind });
}
