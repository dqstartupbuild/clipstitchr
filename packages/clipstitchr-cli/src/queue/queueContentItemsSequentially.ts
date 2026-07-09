import type { QueueContentExecutionResult } from "./QueueContentExecutionResult.js";
import type { QueueContentItem } from "./QueueContentItem.js";
import type { QueueContentPostResult } from "./QueueContentPostResult.js";
import { getQueueContentErrorMessage } from "./getQueueContentErrorMessage.js";

export async function queueContentItemsSequentially(
  items: QueueContentItem[],
  queueItem: (item: QueueContentItem) => Promise<QueueContentPostResult>,
) {
  const results: QueueContentExecutionResult[] = [];

  for (const item of items) {
    try {
      const result = await queueItem(item);

      results.push({
        item,
        postId: result.postReference.postId,
        postStatus: result.postReference.status,
        queued: true,
      });
    } catch (error) {
      results.push({
        item,
        message: getQueueContentErrorMessage(error),
        queued: false,
      });
    }
  }

  return results;
}
