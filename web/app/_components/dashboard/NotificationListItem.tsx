import type { DashboardNotification } from "@/lib/clipstitchr/types/DashboardNotification";

type NotificationListItemProps = {
  notification: DashboardNotification;
  onOpen: (notification: DashboardNotification) => void;
};

export function NotificationListItem({
  notification,
  onOpen,
}: NotificationListItemProps) {
  return (
    <button
      type="button"
      className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      onClick={() => onOpen(notification)}
    >
      <span
        className={[
          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
          notification.isRead ? "bg-border" : "bg-red-600",
        ].join(" ")}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-text-primary">
          {notification.title}
        </span>
        <span className="mt-1 block line-clamp-2 text-xs leading-5 text-text-secondary">
          {notification.preview}
        </span>
      </span>
    </button>
  );
}
