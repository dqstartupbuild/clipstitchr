import type { QueueListItem } from "./QueueListItem.js";

export function formatQueueListWhen(item: QueueListItem) {
  if (item.scheduledAt) {
    const scheduledAt = new Date(item.scheduledAt);

    return Number.isFinite(scheduledAt.getTime())
      ? `Scheduled ${scheduledAt.toISOString()}`
      : "Scheduled";
  }

  return item.queuePosition ? `Queue #${item.queuePosition}` : "Queued";
}
