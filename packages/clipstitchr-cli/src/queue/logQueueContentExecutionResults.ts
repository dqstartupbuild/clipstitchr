import type { QueueContentExecutionResult } from "./QueueContentExecutionResult.js";
import { createQueueContentItemLabel } from "./createQueueContentItemLabel.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

export function logQueueContentExecutionResults(
  results: QueueContentExecutionResult[],
) {
  for (const result of results) {
    const label = createQueueContentItemLabel(result.item);

    if (result.queued) {
      logSuccess(`Queued ${label}.`);
      logKeyValue("Post ID", result.postId);
      logKeyValue("Status", result.postStatus);
    } else {
      logWarning(`Failed ${label}: ${result.message}`);
    }
  }
}
