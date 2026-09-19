"use client";

import dynamic from "next/dynamic";

const StoryExperience = dynamic(
  () =>
    import("@/components/story/StoryExperience").then((m) => m.StoryExperience),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[70vh] items-center justify-center px-6 text-tb-text-muted"
        data-testid="story-loading"
      >
        Loading story…
      </div>
    ),
  },
);

export function StoryPageClient() {
  return <StoryExperience />;
}
