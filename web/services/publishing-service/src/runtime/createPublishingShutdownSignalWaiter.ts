import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";
import type { PublishingRuntimeSignalSource } from "./PublishingRuntimeSignalSource.js";
import type { PublishingShutdownSignalWaiter } from "./PublishingShutdownSignalWaiter.js";
import { createPublishingSignalListener } from "./createPublishingSignalListener.js";
import { createPublishingSignalPromise } from "./createPublishingSignalPromise.js";

export const createPublishingShutdownSignalWaiter = (
  source: PublishingRuntimeSignalSource,
): PublishingShutdownSignalWaiter => {
  const deferred = createPublishingSignalPromise();
  const onSigint = createPublishingSignalListener(deferred.resolve, "SIGINT");
  const onSigterm = createPublishingSignalListener(deferred.resolve, "SIGTERM");

  source.once("SIGINT", onSigint);
  source.once("SIGTERM", onSigterm);

  return Object.freeze({
    promise: deferred.promise,
    dispose() {
      source.off("SIGINT", onSigint);
      source.off("SIGTERM", onSigterm);
    },
  });
};
