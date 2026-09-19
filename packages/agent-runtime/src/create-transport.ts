import type { AgentTransport, AgentTransportKind } from "./ports";
import { getFixtureTransport } from "./fixture-transport";
import { CloudflareAgentTransport } from "./cloudflare-transport";

export type TransportConfig = {
  kind?: AgentTransportKind | string;
  cloudflareUrl?: string;
};

/**
 * Factory used by the Next composition root.
 * Default: fixture (zero keys, e2e-safe).
 */
export function createAgentTransport(config: TransportConfig = {}): AgentTransport {
  const kind = (config.kind ?? "fixture").toLowerCase();
  if (kind === "cloudflare") {
    return new CloudflareAgentTransport(config.cloudflareUrl ?? "");
  }
  return getFixtureTransport();
}
