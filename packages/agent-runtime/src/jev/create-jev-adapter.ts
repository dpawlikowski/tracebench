import type { JevAdapter, JevAdapterKind } from "./ports";
import { MockJevAdapter } from "./mock-jev-adapter";
import { LiveJevAdapter, type LiveJevAdapterOptions } from "./live-jev-adapter";

export type CreateJevAdapterConfig = {
  /** Default: mock (zero keys). Set `live` only when AI Gateway OIDC is available. */
  kind?: JevAdapterKind | string;
  live?: LiveJevAdapterOptions;
};

/**
 * Factory used by the composition root.
 * MockJevAdapter is ALWAYS the default — live is opt-in via JEV_ADAPTER=live.
 */
export function createJevAdapter(config: CreateJevAdapterConfig = {}): JevAdapter {
  const kind = (config.kind ?? process.env.JEV_ADAPTER ?? "mock").toLowerCase();
  if (kind === "live") {
    return new LiveJevAdapter(config.live);
  }
  return new MockJevAdapter();
}

let singleton: JevAdapter | undefined;

export function getJevAdapter(): JevAdapter {
  if (!singleton) singleton = createJevAdapter();
  return singleton;
}

/** Test helper — reset singleton between cases. */
export function resetJevAdapter(): void {
  singleton = undefined;
}
