import type { Doc } from "@/convex/_generated/dataModel";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

export function createDashboardNotificationFromConvexDocument(
  notification: Doc<"notifications">,
): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    preview: notification.preview,
    message: notification.message,
    sourceType: notification.sourceType,
    sourceId: notification.sourceId,
    productId: notification.productId,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}
