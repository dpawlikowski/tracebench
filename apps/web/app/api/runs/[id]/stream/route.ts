import { subscribeRun } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * SSE ReadableStream — versioned StreamFrame v1 via AgentTransport.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const speed = Number(url.searchParams.get("speed") ?? "1") || 1;

  const res = await subscribeRun(id, { speed, signal: req.signal });
  // Pass through transport Response (fixture stream or CF proxy).
  return res;
}
