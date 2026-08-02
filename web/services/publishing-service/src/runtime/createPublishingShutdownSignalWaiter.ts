import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";
import type { PublishingRuntimeSignalSource } from "./PublishingRuntimeSignalSource.js";
import type { PublishingShutdownSignalWaiter } from "./PublishingShutdownSignalWaiter.js";

export const createPublishingShutdownSignalWaiter = (
  source: PublishingRuntimeSignalSource,
): PublishingShutdownSignalWaiter => {
  let resolveSignal: ((signal: PublishingRuntimeSignal) => void) | undefined;
  const promise = new Promise<PublishingRuntimeSignal>((resolve) => {
    resolveSignal = resolve;
  });
  const onSigint = (): void => resolveSignal?.("SIGINT");
  const onSigterm = (): void => resolveSignal?.("SIGTERM");

  source.once("SIGINT", onSigint);
  source.once("SIGTERM", onSigterm);

  return Object.freeze({
    promise,
    dispose() {
      resolveSignal = undefined;
      source.off("SIGINT", onSigint);
      source.off("SIGTERM", onSigterm);
    },
  });
};
