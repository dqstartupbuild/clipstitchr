import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardNotificationBell } from "@/app/_components/dashboard/DashboardNotificationBell";
import { NotificationDetailDialog } from "@/app/_components/dashboard/NotificationDetailDialog";
import { NotificationListPopover } from "@/app/_components/dashboard/NotificationListPopover";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

const mocks = vi.hoisted(() => ({
  clearAll: vi.fn(),
  markAllRead: vi.fn(),
  markRead: vi.fn(),
  notifications: [] as DashboardNotification[],
  remove: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardNotifications", () => ({
  useDashboardNotifications: () => ({
    clearAll: mocks.clearAll,
    isLoading: false,
    markAllRead: mocks.markAllRead,
    markRead: mocks.markRead,
    notifications: mocks.notifications,
    remove: mocks.remove,
    unreadCount: mocks.notifications.filter((notification) => !notification.isRead)
      .length,
  }),
}));

function createNotification(
  overrides: Partial<DashboardNotification> = {},
): DashboardNotification {
  return {
    createdAt: "2026-06-18T12:00:00.000Z",
    id: "notification_1",
    isRead: false,
    message: "Your Stitch finished.",
    preview: "Launch Stitch is ready.",
    sourceType: "stitch",
    title: "Stitch is ready",
    updatedAt: "2026-06-18T12:00:00.000Z",
    ...overrides,
  };
}

describe("DashboardNotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notifications = [];
  });

  it("shows the unread notification count on the bell", () => {
    mocks.notifications = [
      createNotification({ id: "notification_1" }),
      createNotification({ id: "notification_2", isRead: true }),
      createNotification({ id: "notification_3" }),
    ];

    const markup = renderToStaticMarkup(<DashboardNotificationBell />);

    expect(markup).toContain("Notifications");
    expect(markup).toContain(">2</span>");
  });

  it("renders notification list controls and empty states", () => {
    const emptyMarkup = renderToStaticMarkup(
      <NotificationListPopover
        isLoading={false}
        notifications={[]}
        onClearAll={vi.fn()}
        onMarkAllRead={vi.fn()}
        onOpenNotification={vi.fn()}
      />,
    );

    expect(emptyMarkup).toContain("No notifications yet.");

    const populatedMarkup = renderToStaticMarkup(
      <NotificationListPopover
        isLoading={false}
        notifications={[createNotification()]}
        onClearAll={vi.fn()}
        onMarkAllRead={vi.fn()}
        onOpenNotification={vi.fn()}
      />,
    );

    expect(populatedMarkup).toContain("Read all");
    expect(populatedMarkup).toContain("Clear all");
    expect(populatedMarkup).toContain("Launch Stitch is ready.");
    expect(populatedMarkup).toContain("fixed left-3 right-3 top-20");
    expect(populatedMarkup).toContain("max-h-[calc(100dvh-6rem)]");
  });

  it("renders the full notification dialog", () => {
    const markup = renderToStaticMarkup(
      <NotificationDetailDialog
        notification={createNotification()}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(markup).toContain("Stitch is ready");
    expect(markup).toContain("Your Stitch finished.");
    expect(markup).toContain("Delete");
  });
});
