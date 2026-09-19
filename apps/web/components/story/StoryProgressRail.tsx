"use client";

import { cn } from "@tracebench/ui";
import { STORY_SECTIONS, type StorySectionId } from "./story-copy";

type Props = {
  active: StorySectionId;
  progress: number; // 0–1
  reduced: boolean;
  onJump: (id: StorySectionId) => void;
};

/** Act grouping for film chapter index (Inkwell-style pathfinder). */
const ACTS: { label: string; ids: StorySectionId[] }[] = [
  { label: "I", ids: ["hero", "blind-spot", "what-breaks"] },
  { label: "II", ids: ["answer", "outcomes"] },
  { label: "III", ids: ["how-teams", "proof", "cta"] },
];

/**
 * Fixed right pathfinder — film chapter index.
 * Jumps kept; visual quality of award-site progress.
 */
export function StoryProgressRail({ active, progress, reduced, onJump }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <aside
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-6"
      aria-label="Story chapters"
      data-testid="story-progress-rail"
    >
      <div className="tb-pathfinder pointer-events-auto flex w-[9.5rem] flex-col gap-2 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="tb-act-label m-0">Film</span>
          <span className="font-mono text-[10px] tabular-nums text-tb-text-dim">{pct}%</span>
        </div>

        <div
          className="relative h-[3px] w-full overflow-hidden rounded-full bg-tb-border"
          aria-hidden
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-tb-accent transition-[width] duration-150 ease-out"
            style={{
              width: `${pct}%`,
              transitionDuration: reduced ? "0ms" : undefined,
            }}
          />
        </div>

        <nav className="mt-1 flex flex-col gap-3" aria-label="Jump chapter">
          {ACTS.map((act) => (
            <div key={act.label} className="flex flex-col gap-0.5">
              <span className="mb-0.5 text-[9px] font-medium tracking-[0.12em] text-tb-text-dim">
                ACT {act.label}
              </span>
              {act.ids.map((id) => {
                const s = STORY_SECTIONS.find((x) => x.id === id)!;
                const i = STORY_SECTIONS.findIndex((x) => x.id === id);
                const isActive = id === active;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onJump(id)}
                    className={cn(
                      "group flex min-h-[26px] w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 text-left transition-colors duration-150",
                      isActive
                        ? "bg-tb-accent-soft/50 text-tb-text"
                        : "text-tb-text-dim hover:bg-tb-bg-hover hover:text-tb-text-muted",
                    )}
                    aria-current={isActive ? "true" : undefined}
                    data-testid={`story-rail-${id}`}
                  >
                    <span className="min-w-0 truncate text-[10px] font-medium tracking-tight">
                      <span className="mr-1.5 font-mono tabular-nums text-tb-text-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full border border-tb-border-strong transition-all duration-150",
                        isActive &&
                          "h-2 w-2 border-tb-accent bg-tb-accent shadow-[0_0_0_3px_rgba(180,240,60,0.18)]",
                      )}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
