"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { DashboardDialogViewport } from "@/app/_components/ui/DashboardDialogViewport";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

type NotificationDetailDialogProps = {
  notification: DashboardNotification;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function NotificationDetailDialog({
  notification,
  onClose,
  onDelete,
}: NotificationDetailDialogProps) {
  return (
    <DashboardDialogViewport onClose={onClose} notification>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-detail-title"
        className="w-full max-w-lg rounded-lg border border-border bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              Notification
            </p>
            <h2
              id="notification-detail-title"
              className="mt-2 text-xl font-bold text-text-primary"
            >
              {notification.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close notification"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-muted"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
          {notification.message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Dismiss
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => onDelete(notification.id)}
          >
            Delete
          </Button>
        </div>
      </section>
    </DashboardDialogViewport>
  );
}
