import type { QueueContentExecutionResult } from "./QueueContentExecutionResult.js";

export function throwIfQueueContentExecutionFailed(
  results: QueueContentExecutionResult[],
) {
  const failedCount = results.filter((result) => !result.queued).length;

  if (failedCount > 0) {
    throw new Error(
      failedCount === results.length
        ? "No queue items were added."
        : `${failedCount} queue item${failedCount === 1 ? "" : "s"} failed.`,
    );
  }
}
