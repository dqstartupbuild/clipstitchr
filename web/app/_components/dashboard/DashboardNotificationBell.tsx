"use client";

import { Bell } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { NotificationDetailDialog } from "@/app/_components/dashboard/NotificationDetailDialog";
import { NotificationListPopover } from "@/app/_components/dashboard/NotificationListPopover";
import { NotificationUnreadBadge } from "@/app/_components/dashboard/NotificationUnreadBadge";
import { useDashboardNotifications } from "@/lib/clipstitchr/hooks/useDashboardNotifications";
import { useDismissOnOutsidePointer } from "@/lib/clipstitchr/hooks/useDismissOnOutsidePointer";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

export function DashboardNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    clearAll,
    isLoading,
    markAllRead,
    markRead,
    notifications,
    remove,
    unreadCount,
  } = useDashboardNotifications(isOpen);
  const [selectedNotification, setSelectedNotification] =
    useState<DashboardNotification | null>(null);
  const closeNotificationCenter = useCallback(() => setIsOpen(false), []);

  useDismissOnOutsidePointer({
    containerRef,
    isEnabled: isOpen,
    onDismiss: closeNotificationCenter,
  });

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="dashboard-notification-button relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <Bell aria-hidden className="h-5 w-5" />
        <NotificationUnreadBadge count={unreadCount} />
      </button>
      {isOpen ? (
        <NotificationListPopover
          isLoading={isLoading}
          notifications={notifications}
          onClearAll={() => {
            setSelectedNotification(null);
            void clearAll();
          }}
          onMarkAllRead={() => {
            void markAllRead();
          }}
          onOpenNotification={(notification) => {
            setSelectedNotification(notification);
            setIsOpen(false);
            if (!notification.isRead) {
              void markRead(notification.id);
            }
          }}
        />
      ) : null}
      {selectedNotification ? (
        <NotificationDetailDialog
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={(id) => {
            setSelectedNotification(null);
            void remove(id);
          }}
        />
      ) : null}
    </div>
  );
}
