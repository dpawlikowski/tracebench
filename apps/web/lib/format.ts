export function formatUsd(n: number): string {
  return `$${n.toFixed(n < 0.01 ? 4 : 3)}`;
}

export function formatMs(n: number): string {
  if (n < 1000) return `${Math.round(n)}ms`;
  return `${(n / 1000).toFixed(1)}s`;
}

export function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Warsaw",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function statusTone(
  status: string,
): "success" | "danger" | "warning" | "accent" | "neutral" {
  switch (status) {
    case "succeeded":
    case "approved":
      return "success";
    case "failed":
    case "denied":
    case "cancelled":
      return "danger";
    case "awaiting_approval":
    case "pending":
      return "warning";
    case "running":
    case "streaming":
      return "accent";
    default:
      return "neutral";
  }
}

export function riskTone(risk: string): "low" | "medium" | "high" {
  if (risk === "high") return "high";
  if (risk === "medium") return "medium";
  return "low";
}

/** Decision-first microcopy for ops header strips. */
export function decisionSummary(input: {
  awaiting: number;
  burnUsd: number;
  jevEscalated?: number;
}): string {
  const parts: string[] = [];
  if (input.awaiting > 0) parts.push(`${input.awaiting} awaiting`);
  parts.push(`$${input.burnUsd.toFixed(2)} burn`);
  if (input.jevEscalated !== undefined && input.jevEscalated > 0) {
    parts.push(`Jev escalated ${input.jevEscalated}`);
  }
  return parts.join(" · ");
}
