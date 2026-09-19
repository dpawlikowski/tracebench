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
      className="mb-4 rounded-md border border-tb-warning bg-tb-warning-soft p-3.5 shadow-[0_0_0_1px_rgba(212,160,23,0.12)]"
    >
      <div className="mb-2 flex items-center justify-between gap-2 font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-tb-warning motion-safe:animate-pulse" />
          Pending human approvals
        </div>
        <HelpTip
          title="HITL approvals"
          body="Medium/high-risk tools pause for a human. Review args, then Approve (⌘Enter) or Deny. Decisions append to the audit log."
          href="/help/hitl-jev"
        />
      </div>
      <div className="flex flex-col gap-2">
        {pending.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-tb-warning/30 bg-tb-bg/50 px-3 py-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-[13px]">{a.toolName}</code>
                <Badge tone={riskTone(a.risk)}>{a.risk}</Badge>
              </div>
              <div className="text-[13px] text-tb-text-muted">{a.reason}</div>
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
        <div role="alert" className="mt-2 text-[13px] text-tb-danger">
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
            <p className="mt-0">{active.reason}</p>
            <pre className="overflow-auto rounded-md border border-tb-border bg-tb-bg p-3 font-mono text-xs text-tb-text">
              {JSON.stringify(active.argsPreview, null, 2)}
            </pre>
            {active.risk === "high" && (
              <p className="text-[13px] text-tb-danger">
                High risk · irreversible tool. Confirm only if dual-control is satisfied.{" "}<Kbd className="ml-1">⌘↵</Kbd>
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
