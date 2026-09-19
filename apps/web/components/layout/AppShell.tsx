"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@tracebench/ui";
import { usePrefs, hydratePrefsDom } from "@/lib/prefs";
import { openCommandPalette } from "@/components/command/events";
import { useRuns } from "@/lib/hooks/use-runs";
import { decisionSummary, formatUsd } from "@/lib/format";
import { prefetchEvals } from "@/lib/prefetch";
import { DemoModeBadge } from "@/components/demo/DemoModeBadge";

const CommandPalette = dynamic(
  () =>
    import("@/components/command/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

const ProductTour = dynamic(
  () => import("@/components/help/ProductTour").then((m) => m.ProductTour),
  { ssr: false },
);

const nav = [
  { href: "/", label: "Overview", short: "Home", tour: "nav-overview" },
  { href: "/runs", label: "Runs", short: "Runs", tour: "nav-runs" },
  { href: "/evals", label: "Evals", short: "Evals", tour: "nav-evals" },
  { href: "/dashboards", label: "Boards", short: "Boards", tour: "nav-boards" },
  { href: "/ops", label: "Ops", short: "Ops", tour: "nav-ops" },
  { href: "/policy", label: "Policy", short: "Policy", tour: "nav-policy" },
  { href: "/help", label: "Help", short: "Help", tour: "nav-help" },
  { href: "/story", label: "Story", short: "Story", tour: "nav-story" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { density, navCollapsed, setDensity, toggleNav } = usePrefs();
  const { data: runs } = useRuns();
  const queryClient = useQueryClient();
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    hydratePrefsDom();
  }, []);

  const awaiting = runs?.filter((r) => r.status === "awaiting_approval").length ?? 0;
  const burn = runs?.reduce((s, r) => s + r.metrics.totalCostUsd, 0) ?? 0;
  const denied = runs?.filter((r) => r.status === "denied").length ?? 0;
  const jevEscalated = awaiting + denied;

  const micro = decisionSummary({
    awaiting,
    burnUsd: burn,
    jevEscalated,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-tb-border bg-tb-bg px-3"
        style={{ paddingBlock: "var(--tb-header-py, 0.625rem)" }}
        data-tour="app-header"
      >
        <button
          type="button"
          onClick={toggleNav}
          className="tb-interactive rounded-sm border border-tb-border px-2 py-1 text-[11px] text-tb-text-dim hover:text-tb-text"
          aria-label={navCollapsed ? "Expand nav" : "Collapse nav"}
          title="Collapse nav"
        >
          {navCollapsed ? "»" : "«"}
        </button>
        <Link
          href="/"
          className="shrink-0 font-semibold tracking-tight text-tb-text no-underline transition-colors duration-150 hover:text-tb-accent"
          data-tour="nav-overview"
        >
          Tracebench
        </Link>
        <nav
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto",
            navCollapsed && "max-w-[220px]",
          )}
          aria-label="Primary"
        >
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                data-tour={item.tour}
                data-testid={`nav-${item.short.toLowerCase()}`}
                onMouseEnter={() => {
                  if (item.href === "/evals") void prefetchEvals(queryClient);
                }}
                onFocus={() => {
                  if (item.href === "/evals") void prefetchEvals(queryClient);
                }}
                className={cn(
                  "tb-interactive rounded-sm px-2.5 py-1 text-[13px] no-underline",
                  active
                    ? "bg-tb-bg-hover font-semibold text-tb-text shadow-[inset_0_-1px_0_0_var(--tb-accent)]"
                    : "text-tb-text-muted hover:bg-tb-bg-hover hover:text-tb-text",
                )}
              >
                {navCollapsed ? item.short : item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <DemoModeBadge />
          <p
            ref={liveRef}
            className="hidden max-w-[240px] truncate text-[11px] text-tb-text-dim tabular-nums md:block"
            data-testid="decision-microcopy"
            title={micro}
            aria-live="polite"
            aria-atomic="true"
          >
            {micro}
          </p>
          <button
            type="button"
            data-testid="density-toggle"
            onClick={() => setDensity(density === "dense" ? "comfortable" : "dense")}
            className="tb-interactive rounded-sm border border-tb-border px-2 py-1 text-[11px] font-medium text-tb-text-muted hover:text-tb-text"
            aria-pressed={density === "dense"}
            title="Toggle comfortable / dense"
          >
            {density === "dense" ? "Dense" : "Comfort"}
          </button>
          <button
            type="button"
            data-testid="open-command-palette"
            onClick={() => openCommandPalette()}
            className="tb-interactive hidden items-center gap-1 rounded-sm border border-tb-border px-2 py-1 font-mono text-[11px] text-tb-text-dim hover:text-tb-text sm:inline-flex"
          >
            ⌘K
          </button>
          <div className="hidden text-[11px] text-tb-text-dim lg:block">
            <span className="tabular-nums">{formatUsd(burn)}</span> seeded
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer
        className="border-t border-tb-border px-4 py-3 text-[11px] text-tb-text-dim"
        data-testid="app-footer"
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2">
          <span>Tracebench · Agent Ops Workbench</span>
          <nav className="flex flex-wrap gap-3" aria-label="Footer">
            <Link href="/story" className="text-tb-text-muted no-underline hover:text-tb-accent">
              Why Tracebench
            </Link>
            <Link href="/help/demo-mode" className="text-tb-text-muted no-underline hover:text-tb-accent">
              Demo Mode
            </Link>
            <Link href="/architecture" className="text-tb-text-muted no-underline hover:text-tb-accent">
              Architecture
            </Link>
          </nav>
        </div>
      </footer>
      <CommandPalette />
      <ProductTour />
    </div>
  );
}
