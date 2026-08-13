import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";

export const createPublishingSignalPromise = (): Readonly<{
  promise: Promise<PublishingRuntimeSignal>;
  resolve: (signal: PublishingRuntimeSignal) => void;
}> => {
  let resolveSignal: ((signal: PublishingRuntimeSignal) => void) | undefined;
  const promise = new Promise<PublishingRuntimeSignal>((resolve) => {
    resolveSignal = resolve;
  });

  if (resolveSignal === undefined) {
    throw new Error("Publishing signal promise could not be initialized.");
  }

  return Object.freeze({ promise, resolve: resolveSignal });
};
