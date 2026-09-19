import { NextResponse } from "next/server";
import { z } from "zod";
import { decideApproval, getRun } from "@/lib/store";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  approvalId: z.string(),
  decision: z.enum(["approved", "denied"]),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const run = await getRun(id);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = await decideApproval(id, body.approvalId, body.decision, undefined, body.note);
  if (!updated) {
    return NextResponse.json({ error: "Approval failed" }, { status: 400 });
  }
  return NextResponse.json({ run: updated });
}
