"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useRuns } from "@/lib/hooks/use-runs";
import { usePrefs } from "@/lib/prefs";
import { OPEN_COMMAND_EVENT, consumePendingCommandOpen } from "@/components/command/events";
import { readRecentRuns } from "@/lib/recent-runs";
import { HELP_ARTICLES } from "@/lib/help-articles";
import { clearTourSeen, requestStartTour } from "@/lib/tour";

export { openCommandPalette, OPEN_COMMAND_EVENT } from "@/components/command/events";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<{ id: string; title?: string; at: number }[]>([]);
  const router = useRouter();
  const { data: runs } = useRuns();
  const { toggleDensity, toggleNav, density } = usePrefs();
  const openerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    const el = openerRef.current;
    openerRef.current = null;
    window.setTimeout(() => el?.focus?.(), 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) openerRef.current = document.activeElement as HTMLElement | null;
          else {
            const el = openerRef.current;
            openerRef.current = null;
            window.setTimeout(() => el?.focus?.(), 0);
          }
          return !o;
        });
      }
      if (e.key === "Escape") close();
    };
    const onOpen = () => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    // Dynamic import race: ⌘K button may fire before this chunk mounts.
    if (consumePendingCommandOpen()) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) setRecent(readRecentRuns());
  }, [open]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [router, close],
  );

  const pending = useMemo(
    () => runs?.filter((r) => r.status === "awaiting_approval") ?? [],
    [runs],
  );

  const runById = useMemo(() => new Map(runs?.map((r) => [r.id, r]) ?? []), [runs]);

  const recentResolved = useMemo(
    () =>
      recent
        .map((r) => {
          const live = runById.get(r.id);
          return live
            ? { id: live.id, title: live.title }
            : { id: r.id, title: r.title ?? r.id };
        })
        .filter((r) => !!r.id),
    [recent, runById],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] grid place-items-start bg-black/65 pt-[12vh] px-4"
      role="presentation"
      onClick={close}
      data-testid="command-palette-backdrop"
    >
      <Command
        label="Command palette"
        className="tb-modal-panel mx-auto w-full max-w-[520px] overflow-hidden rounded-lg border border-tb-border-strong bg-tb-bg-elevated shadow-[var(--tb-shadow-modal)]"
        onClick={(e) => e.stopPropagation()}
        data-testid="command-palette"
      >
        <Command.Input
          placeholder="Jump to run, evals, help…"
          className="w-full border-0 border-b border-tb-border bg-transparent px-4 py-3 text-sm text-tb-text outline-none placeholder:text-tb-text-dim"
          autoFocus
        />
        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-tb-text-muted">
            No matches
          </Command.Empty>

          <Group heading="Navigate">
            <Item onSelect={() => go("/")} hint="G H">
              Overview
            </Item>
            <Item onSelect={() => go("/runs")} hint="G R">
              Runs
            </Item>
            <Item onSelect={() => go("/evals")} hint="G E">
              Evals / release gate
            </Item>
            <Item onSelect={() => go("/policy")} hint="G P">
              Risk policy (Jev)
            </Item>
            <Item onSelect={() => go("/help")} hint="G ?">
              Help hub
            </Item>
            <Item onSelect={() => go("/story")}>
              Why Tracebench / Business story
            </Item>
            <Item onSelect={() => go("/architecture")}>
              Architecture
            </Item>
            <Item onSelect={() => go("/dashboards")}>
              Ops dashboards
            </Item>
            <Item onSelect={() => go("/ops")}>
              Ops Trace
            </Item>
            <Item onSelect={() => go("/runs?status=awaiting_approval")}>
              Pending approvals ({pending.length})
            </Item>
          </Group>

          <Group heading="Help">
            <Item onSelect={() => go("/help/faq")}>
              FAQ & product tour
            </Item>
            <Item onSelect={() => go("/help/demo-mode")}>
              Demo mode — 90s click path
            </Item>
            <Item onSelect={() => go("/runs/run_live_approve")}>
              Start demo script (HITL run)
            </Item>
            <Item
              onSelect={() => {
                clearTourSeen();
                close();
                requestStartTour();
              }}
            >
              Start product tour
            </Item>
            {HELP_ARTICLES.map((a) => (
              <Item key={a.slug} onSelect={() => go(`/help/${a.slug}`)}>
                {a.title}
              </Item>
            ))}
          </Group>

          {recentResolved.length > 0 && (
            <Group heading="Recent runs">
              {recentResolved.map((r) => (
                <Item key={`recent-${r.id}`} onSelect={() => go(`/runs/${r.id}`)}>
                  <span className="font-medium">{r.title}</span>
                  <code className="ml-2 font-mono text-[11px] text-tb-text-dim">{r.id}</code>
                </Item>
              ))}
            </Group>
          )}

          {pending.length > 0 && (
            <Group heading="Awaiting approval">
              {pending.map((r) => (
                <Item key={r.id} onSelect={() => go(`/runs/${r.id}`)}>
                  <span className="font-medium">{r.title}</span>
                  <code className="ml-2 font-mono text-[11px] text-tb-text-dim">{r.id}</code>
                </Item>
              ))}
            </Group>
          )}

          {runs && runs.length > 0 && (
            <Group heading="All runs">
              {runs.map((r) => (
                <Item key={r.id} onSelect={() => go(`/runs/${r.id}`)}>
                  <span className="font-medium">{r.title}</span>
                  <code className="ml-2 font-mono text-[11px] text-tb-text-dim">{r.id}</code>
                </Item>
              ))}
            </Group>
          )}

          <Group heading="Preferences">
            <Item
              onSelect={() => {
                toggleDensity();
                close();
              }}
              hint="D"
            >
              Toggle density (now {density})
            </Item>
            <Item
              onSelect={() => {
                toggleNav();
                close();
              }}
            >
              Toggle nav collapse
            </Item>
          </Group>
        </Command.List>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tb-border px-3 py-2 text-[11px] text-tb-text-dim">
          <span>↑↓ navigate · ↵ select · Esc close · ⌘Enter approve in modal · R replay</span>
          <kbd className="rounded-md border border-tb-border bg-tb-bg px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
      </Command>
    </div>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-tight [&_[cmdk-group-heading]]:text-tb-text-dim"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  onSelect,
  hint,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  hint?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-[13px] text-tb-text aria-selected:bg-tb-bg-hover data-[selected=true]:bg-tb-bg-hover"
    >
      <span className="min-w-0 truncate">{children}</span>
      {hint && (
        <kbd className="shrink-0 rounded-md border border-tb-border bg-tb-bg px-1.5 py-0.5 font-mono text-[10px] text-tb-text-dim">
          {hint}
        </kbd>
      )}
    </Command.Item>
  );
}
