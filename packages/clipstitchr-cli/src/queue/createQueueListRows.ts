import type { QueueListItem } from "./QueueListItem.js";
import { formatQueueListAccounts } from "./formatQueueListAccounts.js";
import { formatQueueListContentType } from "./formatQueueListContentType.js";
import { formatQueueListProduct } from "./formatQueueListProduct.js";
import { formatQueueListWhen } from "./formatQueueListWhen.js";
import { truncateQueueListText } from "./truncateQueueListText.js";

export function createQueueListRows(items: QueueListItem[]) {
  return [
    "Type\tWhen\tStatus\tTitle\tProduct\tAccounts",
    ...items.map((item) =>
      [
        formatQueueListContentType(item.contentType),
        formatQueueListWhen(item),
        item.status,
        truncateQueueListText(item.title || item.captionPreview || item.postId),
        formatQueueListProduct(item),
        formatQueueListAccounts(item.accountIds),
      ].join("\t"),
    ),
  ];
}
