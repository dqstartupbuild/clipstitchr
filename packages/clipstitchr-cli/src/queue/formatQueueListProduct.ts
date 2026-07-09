import type { QueueListItem } from "./QueueListItem.js";

export function formatQueueListProduct(item: QueueListItem) {
  return item.productName || item.productId || "-";
}
