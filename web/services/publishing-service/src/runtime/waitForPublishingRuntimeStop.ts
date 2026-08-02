import type { PublishingRuntimeStopOutcome } from "./PublishingRuntimeStopOutcome.js";

export const waitForPublishingRuntimeStop = async (
  stopTask: Promise<void>,
  timeoutMilliseconds: number,
): Promise<PublishingRuntimeStopOutcome> => {
  if (
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1 ||
    timeoutMilliseconds > 60_000
  ) {
    throw new RangeError("Publishing shutdown timeout is invalid.");
  }

  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      stopTask.then(
        () => "stopped" as const,
        () => "failed" as const,
      ),
      new Promise<"timed_out">((resolve) => {
        timeout = setTimeout(() => resolve("timed_out"), timeoutMilliseconds);
        timeout.unref();
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
};
