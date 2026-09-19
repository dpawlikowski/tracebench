"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { cn } from "../lib/cn";

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  onDeny?: () => void;
  confirmLabel?: string;
  denyLabel?: string;
  danger?: boolean;
  busy?: boolean;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  onDeny,
  confirmLabel = "Approve",
  denyLabel = "Deny",
  danger = false,
  busy = false,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      if (confirmRef.current) {
        confirmRef.current.focus();
      } else {
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      }
    }, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onDocKey(e: globalThis.KeyboardEvent) {
      if (!dialogRef.current) return;
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onDocKey, true);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onDocKey, true);
      document.body.style.overflow = prevOverflow;
      prev?.focus();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(e: KeyboardEvent) {
    if (busy) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onConfirm) {
      e.preventDefault();
      onConfirm();
    }
  }

  return (
    <div
      role="presentation"
      onKeyDown={onKeyDown}
      className="tb-modal-backdrop fixed inset-0 z-[1000] grid place-items-center bg-black/65 p-6"
      onClick={() => !busy && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-testid="approval-modal"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "tb-modal-panel w-[min(480px,100%)] rounded-lg border bg-tb-bg-elevated p-5 shadow-[var(--tb-shadow-modal)]",
          danger ? "border-risk-high/55" : "border-tb-border-strong",
        )}
      >
        <h2 id={titleId} className="mb-3 mt-0 text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <div id={descId} className="mb-5 text-tb-text-muted">
          {children}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy} data-testid="modal-cancel">
            Cancel
          </Button>
          {onDeny && (
            <Button
              variant={danger ? "secondary" : "danger"}
              onClick={onDeny}
              disabled={busy}
              data-testid="modal-deny"
            >
              {denyLabel}
            </Button>
          )}
          {onConfirm && (
            <Button
              ref={confirmRef}
              variant={danger ? "danger" : "success"}
              onClick={onConfirm}
              disabled={busy}
              data-testid="modal-approve"
            >
              {confirmLabel}
            </Button>
          )}
        </div>
        <p className="mb-0 mt-3 text-[11px] text-tb-text-dim">
          Esc cancel · ⌘/Ctrl+Enter approve · Tab cycles
        </p>
      </div>
    </div>
  );
}
