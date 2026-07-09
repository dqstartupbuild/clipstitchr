import type { QueueContentItem } from "./QueueContentItem.js";

export function createQueueContentItemLabel({ item, type }: QueueContentItem) {
  const typeLabel = type === "stitch" ? "Stitch" : "Swipe";

  return `${typeLabel} ${item.name} (${item.id})`;
}
