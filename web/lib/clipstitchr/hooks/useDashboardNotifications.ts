"use client";

import { useCallback, useMemo } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createDashboardNotificationFromConvexDocument } from "@/lib/clipstitchr/backend/createDashboardNotificationFromConvexDocument";

export function useDashboardNotifications() {
  const { isAuthenticated } = useConvexAuth();
  const notificationDocuments = useQuery(
    api.notifications.listRecent,
    isAuthenticated ? { limit: 50 } : "skip",
  );
  const markReadMutation = useMutation(api.notifications.markRead);
  const markAllReadMutation = useMutation(api.notifications.markAllRead);
  const removeMutation = useMutation(api.notifications.remove);
  const clearAllMutation = useMutation(api.notifications.clearAll);
  const notifications = useMemo(
    () =>
      notificationDocuments?.map(createDashboardNotificationFromConvexDocument) ??
      [],
    [notificationDocuments],
  );
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );
  const markRead = useCallback(
    async (id: string) => {
      await markReadMutation({ id });
    },
    [markReadMutation],
  );
  const markAllRead = useCallback(async () => {
    await markAllReadMutation({});
  }, [markAllReadMutation]);
  const remove = useCallback(
    async (id: string) => {
      await removeMutation({ id });
    },
    [removeMutation],
  );
  const clearAll = useCallback(async () => {
    await clearAllMutation({});
  }, [clearAllMutation]);

  return {
    clearAll,
    isLoading: isAuthenticated && notificationDocuments === undefined,
    markAllRead,
    markRead,
    notifications,
    remove,
    unreadCount,
  };
}
