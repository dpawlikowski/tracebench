"use client";

import type { AgentRun, Approval } from "@tracebench/schemas";
import { Badge, Button, Kbd, Modal } from "@tracebench/ui";
import { HelpTip } from "@/components/help/HelpTip";
import { riskTone } from "@/lib/format";

export function ApprovalGate({
  run,
  activeApprovalId,
  busy,
  error,
  onOpen,
  onClose,
  onDecide,
}: {
  run: AgentRun;
  activeApprovalId: string | null;
  busy: boolean;
  error: string | null;
  onOpen: (approvalId: string) => void;
  onClose: () => void;
  onDecide: (decision: "approved" | "denied") => void;
}) {
  const pending = run.approvals.filter((a) => a.status === "pending");
  const active: Approval | null =
    pending.find((a) => a.id === activeApprovalId) ?? null;

  if (pending.length === 0) return null;

  return (
    <div
      data-testid="approval-gate"
      className="mb-5 overflow-hidden rounded-lg border border-tb-warning/45 bg-tb-warning-soft/40"
    >
      <div className="flex items-center justify-between gap-2 border-b border-tb-warning/25 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-tb-warning motion-safe:animate-pulse"
            aria-hidden
          />
          <span className="text-[12px] font-medium tracking-tight text-tb-text">
            Pending human approvals
          </span>
          <Badge tone="warning" className="normal-case tracking-normal">
            {pending.length}
          </Badge>
        </div>
        <HelpTip
          title="HITL approvals"
          body="Medium/high-risk tools pause for a human. Review args, then Approve (⌘Enter) or Deny. Decisions append to the audit log."
          href="/help/hitl-jev"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        {pending.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-tb-border bg-tb-bg-elevated/80 px-3 py-2.5 transition-colors hover:border-tb-border-strong hover:bg-tb-bg-hover/50"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-[13px] font-medium text-tb-text">
                  {a.toolName}
                </code>
                <Badge tone={riskTone(a.risk)}>{a.risk}</Badge>
              </div>
              <div className="mt-0.5 text-[13px] leading-snug text-tb-text-muted">
                {a.reason}
              </div>
            </div>
            <Button
              variant="primary"
              data-testid={`open-approval-${a.id}`}
              onClick={() => onOpen(a.id)}
              disabled={busy}
            >
              Review
            </Button>
          </div>
        ))}
      </div>
      {error && (
        <div role="alert" className="border-t border-tb-danger/30 px-4 py-2 text-[13px] text-tb-danger">
          {error}
        </div>
      )}

      <Modal
        open={!!active}
        title={active ? `Approve ${active.toolName}?` : "Approval"}
        danger={active?.risk === "high"}
        busy={busy}
        confirmLabel={busy ? "Working…" : "Approve"}
        denyLabel="Deny"
        onClose={() => !busy && onClose()}
        onConfirm={() => !busy && onDecide("approved")}
        onDeny={() => !busy && onDecide("denied")}
      >
        {active && (
          <div>
            <p className="mt-0 text-[14px] leading-relaxed text-tb-text-muted">
              {active.reason}
            </p>
            <pre className="overflow-auto rounded-md border border-tb-border bg-tb-bg-sunken p-3 font-mono text-xs text-tb-text">
              {JSON.stringify(active.argsPreview, null, 2)}
            </pre>
            {active.risk === "high" && (
              <p className="text-[13px] text-tb-danger">
                High risk · irreversible tool. Confirm only if dual-control is
                satisfied. <Kbd className="ml-1">⌘↵</Kbd>
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
