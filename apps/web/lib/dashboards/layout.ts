export type WidgetId =
  | "cost_burn"
  | "latency_p95"
  | "tokens"
  | "approval_wait"
  | "jev_escalate"
  | "eval_pass"
  | "tool_mix"
  | "a2a_rate"
  | "pending_hitl";

export type DashItem = {
  i: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export type DashPreset = "live_run" | "fleet_release";

const STORAGE_KEY = "tb.dashboard.layout.v1";

export const WIDGET_META: Record<
  WidgetId,
  { title: string; description: string }
> = {
  cost_burn: { title: "Cost burn", description: "Total seeded USD spend" },
  latency_p95: { title: "Latency p95", description: "p95 tool latency across runs" },
  tokens: { title: "Tokens", description: "In / out tokens" },
  approval_wait: { title: "Approval wait", description: "Runs awaiting HITL" },
  jev_escalate: { title: "Jev escalate %", description: "High/medium risk share" },
  eval_pass: { title: "Eval pass rate", description: "Release gate pass %" },
  tool_mix: { title: "Tool mix", description: "Tool call counts by name" },
  a2a_rate: { title: "A2A msg rate", description: "Agent-to-agent messages" },
  pending_hitl: { title: "Pending HITL", description: "Open approvals" },
};

export const PRESET_LIVE_RUN: DashItem[] = [
  { i: "cost_burn", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "latency_p95", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "pending_hitl", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "a2a_rate", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "tool_mix", x: 0, y: 2, w: 6, h: 3, minW: 3, minH: 2 },
  { i: "approval_wait", x: 6, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
  { i: "tokens", x: 9, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
];

export const PRESET_FLEET: DashItem[] = [
  { i: "eval_pass", x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: "jev_escalate", x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: "cost_burn", x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: "latency_p95", x: 0, y: 2, w: 4, h: 3, minW: 2, minH: 2 },
  { i: "tool_mix", x: 4, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
  { i: "a2a_rate", x: 8, y: 2, w: 4, h: 3, minW: 2, minH: 2 },
];

const WIDGET_IDS = new Set<string>(Object.keys(WIDGET_META));

function isWidgetId(id: unknown): id is WidgetId {
  return typeof id === "string" && WIDGET_IDS.has(id);
}

function sanitizeLayout(layout: unknown, fallback: DashItem[]): DashItem[] {
  if (!Array.isArray(layout) || layout.length === 0) return fallback;
  const cleaned: DashItem[] = [];
  for (const item of layout) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (!isWidgetId(rec.i)) continue;
    const x = Number(rec.x);
    const y = Number(rec.y);
    const w = Number(rec.w);
    const h = Number(rec.h);
    if (![x, y, w, h].every((n) => Number.isFinite(n))) continue;
    cleaned.push({
      i: rec.i,
      x,
      y,
      w,
      h,
      minW: 2,
      minH: 2,
    });
  }
  return cleaned.length ? cleaned : fallback;
}

export function loadLayout(preset: DashPreset): DashItem[] {
  const fallback = preset === "fleet_release" ? PRESET_FLEET : PRESET_LIVE_RUN;
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Record<DashPreset, DashItem[]>>;
    return sanitizeLayout(parsed[preset], fallback);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function saveLayout(preset: DashPreset, layout: DashItem[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, DashItem[]>) : {};
    parsed[preset] = layout;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

/** C4 — append a widget to Live Run board if missing. */
export function promoteWidgetToLiveRun(id: WidgetId): DashItem[] {
  const layout = loadLayout("live_run");
  if (layout.some((x) => x.i === id)) return layout;
  const maxY = layout.reduce((m, x) => Math.max(m, x.y + x.h), 0);
  const next = [...layout, { i: id, x: 0, y: maxY, w: 3, h: 2, minW: 2, minH: 2 }];
  saveLayout("live_run", next);
  return next;
}
