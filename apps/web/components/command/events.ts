export const OPEN_COMMAND_EVENT = "tb:open-command";

/** Survives dynamic-import race: click before CommandPalette chunk mounts. */
let pendingOpen = false;

export function openCommandPalette() {
  if (typeof window === "undefined") return;
  pendingOpen = true;
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}

/** Called by CommandPalette on mount / open-listener attach. */
export function consumePendingCommandOpen(): boolean {
  const v = pendingOpen;
  pendingOpen = false;
  return v;
}
