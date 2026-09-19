export const TOUR_SEEN_KEY = "tb.tour.seen";
export const START_TOUR_EVENT = "tb:start-tour";

export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
}

export function markTourSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOUR_SEEN_KEY, "1");
}

export function clearTourSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOUR_SEEN_KEY);
}

export function requestStartTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
}

/** Disable auto-tour for Playwright / webdriver / ?tour=0 */
export function shouldAutoStartTour(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.PLAYWRIGHT === "1") return false;
  if (window.navigator.webdriver) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("tour") === "0") return false;
  return !hasSeenTour();
}

export const TOUR_STEPS = [
  {
    target: '[data-tour="nav-overview"]',
    content:
      "Welcome to Tracebench — an Agent Ops workbench. Overview is the pitch; the product lives in Runs, Approvals, and Evals.",
    title: "Overview",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-runs"]',
    content: "Browse seeded OpsAgent sessions. Filter by status for shareable recruiter links.",
    title: "Runs",
  },
  {
    target: '[data-tour="run-live"]',
    content:
      "Open the live approval demo — Emergency ledger top-up. Replay streams the tool-call timeline.",
    title: "Live approval run",
  },
  {
    target: '[data-tour="approval-gate"]',
    content:
      "High-risk tools pause here. Review args, then Approve or Deny — the audit log records your decision.",
    title: "HITL approval gate",
  },
  {
    target: '[data-tour="nav-evals"]',
    content:
      "The release gate scorecard. Golden cases are scored by mock-jev (or rules). Gate fail blocks a ship.",
    title: "Evals / release gate",
  },
  {
    target: '[data-tour="nav-help"]',
    content: "Help hub + Restart tour anytime. ⌘K also searches articles.",
    title: "Help",
  },
] as const;
