"use client";

import { toast } from "sonner";

type ToastOpts = {
  runId?: string;
  onViewAudit?: () => void;
  assertive?: boolean;
};

function action(opts?: ToastOpts) {
  if (!opts?.onViewAudit) return undefined;
  return {
    label: "View audit",
    onClick: opts.onViewAudit,
  };
}

export const tbToast = {
  success(message: string, description?: string, opts?: ToastOpts) {
    toast.success(message, {
      description: opts?.runId ? `${description ?? ""} · ${opts.runId}`.trim() : description,
      action: action(opts),
      // sonner uses aria-live polite for success by default
    });
  },
  error(message: string, description?: string, opts?: ToastOpts) {
    toast.error(message, {
      description: opts?.runId ? `${description ?? ""} · ${opts.runId}`.trim() : description,
      action: action(opts),
      duration: 6500,
    });
  },
  info(message: string, description?: string, opts?: ToastOpts) {
    toast(message, {
      description: opts?.runId ? `${description ?? ""} · ${opts.runId}`.trim() : description,
      action: action(opts),
    });
  },
};
