"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Kbd } from "@tracebench/ui";
import { useDemoMode } from "@/lib/hooks/use-demo-mode";

const QUICK = [
  { href: "/runs/run_live_approve", label: "HITL · run_live_approve" },
  { href: "/runs/run_pipeline_ops", label: "Multi-agent · run_pipeline_ops" },
  { href: "/runs/run_pipeline_ops/graph", label: "Graph · observe" },
  { href: "/evals", label: "Evals · mock-jev" },
  { href: "/dashboards", label: "Boards" },
  { href: "/story", label: "Why Tracebench · story" },
] as const;

export function DemoModeBadge() {
  const { data, isLoading } = useDemoMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (isLoading || !data) {
    return (
      <span className="hidden sm:inline-flex">
        <Badge tone="neutral">…</Badge>
      </span>
    );
  }

  const label =
    data.kind === "demo" ? "Demo mode" : data.kind === "hybrid" ? "Hybrid" : "Live";
  const tone = data.kind === "demo" ? "success" : data.kind === "hybrid" ? "warning" : "accent";

  return (
    <div className="relative hidden items-center sm:flex">
      <button
        type="button"
        className="tb-interactive"
        data-testid="demo-mode-badge"
        aria-expanded={open}
        aria-label={`${label}. Transport ${data.transport}, Jev ${data.jev}`}
        title={
          data.kind === "demo"
            ? "Zero keys — fixtures + mock Jev. Click for seeded demo path."
            : data.kind === "hybrid"
              ? "Partial live config. Fixture demo path still available."
              : "Live transport/Jev configured. Demo script still available."
        }
        onClick={() => setOpen((o) => !o)}
      >
        <Badge tone={tone}>{label}</Badge>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Demo mode details"
          data-testid="demo-mode-panel"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] rounded-md border border-tb-border-strong bg-tb-bg-elevated p-3 shadow-none"
        >
          <div className="mb-2 text-[13px] font-semibold text-tb-text">{label}</div>
          <ul className="m-0 mb-3 list-none space-y-1 p-0 font-mono text-[11px] text-tb-text-muted">
            <li>transport={data.transport}</li>
            <li>jev={data.jev}</li>
            <li>eval={data.evalScorer}</li>
          </ul>
          <p className="m-0 mb-2 text-[12px] leading-relaxed text-tb-text-muted">
            Seeded IDs cover HITL, multi-agent A2A, graph, evals, and boards — no empty happy path.
          </p>
          <ul className="m-0 mb-3 list-none space-y-1 p-0 text-[12px]">
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="text-tb-accent no-underline hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Link
              href="/help/demo-mode"
              className="no-underline hover:no-underline"
              onClick={() => setOpen(false)}
            >
              <Button variant="primary" size="sm" className="w-full" data-testid="start-demo-script">
                Start 90s click path
              </Button>
            </Link>
            <Link
              href="/help/faq"
              className="text-center text-[12px] text-tb-accent no-underline hover:underline"
              onClick={() => setOpen(false)}
              data-testid="demo-faq-link"
            >
              FAQ & product tour →
            </Link>
          </div>
          <p className="mb-0 mt-3 text-[10px] text-tb-text-dim">
            Esc closes · also in <Kbd>⌘K</Kbd>
          </p>
        </div>
      )}
    </div>
  );
}
