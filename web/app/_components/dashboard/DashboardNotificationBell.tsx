"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { NotificationDetailDialog } from "@/app/_components/dashboard/NotificationDetailDialog";
import { NotificationListPopover } from "@/app/_components/dashboard/NotificationListPopover";
import { NotificationUnreadBadge } from "@/app/_components/dashboard/NotificationUnreadBadge";
import { useDashboardNotifications } from "@/lib/clipstitchr/hooks/useDashboardNotifications";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

export function DashboardNotificationBell() {
  const {
    clearAll,
    isLoading,
    markAllRead,
    markRead,
    notifications,
    remove,
    unreadCount,
  } = useDashboardNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<DashboardNotification | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <Bell aria-hidden className="h-5 w-5" />
        <NotificationUnreadBadge count={unreadCount} />
      </button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
          />
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
        </>
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
