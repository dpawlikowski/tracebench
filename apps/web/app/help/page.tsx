import Link from "next/link";
import { Card } from "@tracebench/ui";
import { HELP_ARTICLES } from "@/lib/help-articles";
import { RestartTourButton } from "@/components/help/RestartTourButton";

export default function HelpHubPage() {
  return (
    <div className="mx-auto max-w-[860px] px-6 pb-16" style={{ paddingTop: "var(--tb-pad-y)" }}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="tb-section-label m-0 mb-2">Guides</p>
          <h1 className="tb-title m-0">Help</h1>
          <p className="tb-subtitle mt-1.5">
            Short guides for the Agent Ops workbench. Prefer ⌘K to search articles or restart the
            product tour.
          </p>
        </div>
        <RestartTourButton />
      </div>

      <div
        className="mb-5 rounded-md border border-tb-success/40 bg-tb-success-soft/20 p-4"
        data-testid="demo-mode-callout"
      >
        <div className="mb-1 text-sm font-semibold text-tb-text">Demo mode</div>
        <p className="m-0 mb-3 text-[13px] text-tb-text-muted">
          Zero keys by default (<code className="font-mono text-[12px]">fixture</code> +{" "}
          <code className="font-mono text-[12px]">mock-jev</code>). Click through the whole product
          offline.
        </p>
        <Link
          href="/help/demo-mode"
          className="text-[13px] font-medium text-tb-accent no-underline hover:underline"
        >
          Start 90s click path →
        </Link>
      </div>

      <div
        className="mb-5 rounded-md border border-tb-accent/40 bg-tb-accent-soft/15 p-4"
        data-testid="help-faq-callout"
      >
        <div className="mb-1 text-sm font-semibold text-tb-text">FAQ & product tour</div>
        <p className="m-0 mb-3 text-[13px] text-tb-text-muted">
          What Tracebench is, zero-key Demo Mode, and captioned screenshots of the real UI.
        </p>
        <Link
          href="/help/faq"
          className="text-[13px] font-medium text-tb-accent no-underline hover:underline"
        >
          Open FAQ →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="help-hub">
        {HELP_ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/help/${a.slug}`}
            className="text-inherit no-underline hover:no-underline"
            data-testid={`help-card-${a.slug}`}
          >
            <Card padding={16} className="tb-interactive h-full transition-[border-color,background-color] duration-150 ease-out hover:border-tb-accent/40">
              <div className="mb-1 font-semibold">{a.title}</div>
              <div className="text-[13px] text-tb-text-muted">{a.summary}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
