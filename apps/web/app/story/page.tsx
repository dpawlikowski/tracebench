import type { Metadata } from "next";
import { StoryPageClient } from "./StoryPageClient";

export const metadata: Metadata = {
  title: "Why Tracebench — Business story",
  description:
    "Scroll story: the cost of ungoverned agents, HITL control plane, illustrative outcomes, and Demo Mode. Not a feature dump — a business narrative.",
  openGraph: {
    title: "Why Tracebench — Business story",
    description:
      "Ship agents that touch money without flying blind. Control plane narrative with illustrative metrics.",
    type: "website",
  },
};

export default function StoryPage() {
  return <StoryPageClient />;
}
