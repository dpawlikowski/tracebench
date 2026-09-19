const KEY = "tb.recentRuns";
const MAX = 8;

export function pushRecentRun(id: string, title?: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const prev: { id: string; title?: string; at: number }[] = raw
      ? (JSON.parse(raw) as { id: string; title?: string; at: number }[])
      : [];
    const next = [
      { id, title, at: Date.now() },
      ...prev.filter((r) => r.id !== id),
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function readRecentRuns(): { id: string; title?: string; at: number }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as { id: string; title?: string; at: number }[];
  } catch {
    return [];
  }
}
