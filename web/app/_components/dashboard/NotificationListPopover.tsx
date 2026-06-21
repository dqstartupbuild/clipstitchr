import { CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { NotificationListItem } from "@/app/_components/dashboard/NotificationListItem";
import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

type NotificationListPopoverProps = {
  isLoading: boolean;
  notifications: DashboardNotification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
  onOpenNotification: (notification: DashboardNotification) => void;
};

export function NotificationListPopover({
  isLoading,
  notifications,
  onClearAll,
  onMarkAllRead,
  onOpenNotification,
}: NotificationListPopoverProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="fixed left-3 right-3 top-20 z-50 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-lg border border-border bg-white p-2 shadow-xl shadow-slate-900/10 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(24rem,calc(100vw-2rem))] sm:max-h-[min(28rem,calc(100dvh-6rem))]"
    >
      <div className="flex flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-sm font-bold text-text-primary">Notifications</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="subtle"
            icon={<CheckCheck aria-hidden className="h-4 w-4" />}
            disabled={!hasNotifications}
            onClick={onMarkAllRead}
          >
            Read all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            disabled={!hasNotifications}
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto">
        {isLoading ? (
          <p className="px-3 py-6 text-center text-sm text-text-secondary">
            Loading notifications.
          </p>
        ) : null}
        {!isLoading && !hasNotifications ? (
          <p className="px-3 py-6 text-center text-sm text-text-secondary">
            No notifications yet.
          </p>
        ) : null}
        {!isLoading && hasNotifications ? (
          <div className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onOpen={onOpenNotification}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
