import type { PublishingOutboxDispatcher } from "./PublishingOutboxDispatcher.js";
import { waitForPublishingOutboxPoll } from "./waitForPublishingOutboxPoll.js";

export const runPublishingOutboxLoop = async (
  dispatcher: PublishingOutboxDispatcher,
  idlePollMilliseconds: number,
  signal: AbortSignal,
): Promise<void> => {
  if (
    !Number.isInteger(idlePollMilliseconds) ||
    idlePollMilliseconds < 250 ||
    idlePollMilliseconds > 60_000
  ) {
    throw new TypeError("The outbox poll interval is invalid.");
  }

  while (!signal.aborted) {
    const leasedCount = await dispatcher.dispatchOnce(signal);

    if (leasedCount === 0) {
      await waitForPublishingOutboxPoll(idlePollMilliseconds, signal);
    }
  }
};
