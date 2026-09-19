"use client";

import { cn } from "@tracebench/ui";
import { STORY_SECTIONS, type StorySectionId } from "./story-copy";

type Props = {
  active: StorySectionId;
  progress: number; // 0–1
  reduced: boolean;
  onJump: (id: StorySectionId) => void;
};

export function StoryProgressRail({ active, progress, reduced, onJump }: Props) {
  return (
    <aside
      className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      aria-label="Story progress"
      data-testid="story-progress-rail"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div
          className="mb-2 h-16 w-[2px] overflow-hidden rounded-full bg-tb-border"
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
        {STORY_SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onJump(s.id)}
              className={cn(
                "group flex items-center gap-2 text-right transition-colors",
                isActive ? "text-tb-text" : "text-tb-text-dim hover:text-tb-text-muted",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-[0.12em] opacity-0 transition-opacity group-hover:opacity-100",
                  isActive && "opacity-100",
                )}
              >
                {s.label}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full border border-tb-border-strong transition-all",
                  isActive && "h-2 w-2 border-tb-accent bg-tb-accent shadow-[0_0_0_3px_rgba(180,240,60,0.2)]",
                )}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
