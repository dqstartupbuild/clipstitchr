import type { QueueListItem } from "./QueueListItem.js";

export function formatQueueListContentType(
  contentType: QueueListItem["contentType"],
) {
  return contentType === "stitch" ? "Stitch" : "Swipe";
}
