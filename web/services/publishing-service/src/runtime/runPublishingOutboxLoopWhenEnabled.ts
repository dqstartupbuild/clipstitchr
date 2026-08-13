import type { PublishingOutboxDispatcher } from "../outbox/PublishingOutboxDispatcher.js";
import { runPublishingOutboxLoop } from "../outbox/runPublishingOutboxLoop.js";

export const runPublishingOutboxLoopWhenEnabled = async (
  enabled: boolean,
  dispatcher: PublishingOutboxDispatcher,
  idlePollMilliseconds: number,
  signal: AbortSignal,
): Promise<void> => {
  if (enabled) {
    return runPublishingOutboxLoop(
      dispatcher,
      idlePollMilliseconds,
      signal,
    );
  }

  if (signal.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    signal.addEventListener("abort", () => resolve(), { once: true });
  });
};
