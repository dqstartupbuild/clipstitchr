import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";

export const createPublishingSignalListener = (
  resolve: (signal: PublishingRuntimeSignal) => void,
  signal: PublishingRuntimeSignal,
): (() => void) => () => resolve(signal);
