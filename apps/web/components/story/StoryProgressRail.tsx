"use client";

import { cn } from "@tracebench/ui";
import { STORY_SECTIONS, type StorySectionId } from "./story-copy";

type Props = {
  active: StorySectionId;
  progress: number; // 0–1
  reduced: boolean;
  onJump: (id: StorySectionId) => void;
};

/** Fixed right rail — clickable chapter jumps with obvious active state. */
export function StoryProgressRail({ active, progress, reduced, onJump }: Props) {
  return (
    <aside
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-5"
      aria-label="Story progress"
      data-testid="story-progress-rail"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 rounded-lg border border-tb-border/80 bg-tb-bg/80 p-2.5 backdrop-blur-[6px]">
        <div
          className="mb-1 h-14 w-[2px] self-end overflow-hidden rounded-full bg-tb-border"
          aria-hidden
        >
          <div
            className="w-full origin-top bg-tb-accent transition-[height] duration-150 ease-out"
            style={{
              height: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`,
              transitionDuration: reduced ? "0ms" : undefined,
            }}
          />
        </div>
        <p className="mb-1 max-w-[7rem] text-right text-[9px] font-medium tracking-tight text-tb-text-dim">
          Jump chapter
        </p>
        {STORY_SECTIONS.map((s, i) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(s.id)}
              className={cn(
                "group flex min-h-[28px] items-center gap-2 rounded-md px-1.5 py-1 text-right transition-colors",
                isActive
                  ? "bg-tb-accent-soft/40 text-tb-text"
                  : "text-tb-text-dim hover:bg-tb-bg-hover hover:text-tb-text-muted",
              )}
              aria-current={isActive ? "true" : undefined}
              data-testid={`story-rail-${s.id}`}
            >
              <span
                className={cn(
                  "text-[10px] font-medium tracking-tight transition-opacity",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                )}
              >
                <span className="mr-1 tabular-nums text-tb-text-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full border border-tb-border-strong transition-all",
                  isActive &&
                    "h-2 w-2 border-tb-accent bg-tb-accent shadow-[0_0_0_3px_rgba(180,240,60,0.2)]",
                )}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
