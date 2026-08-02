import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";

export type PublishingRuntimeSignalSource = Readonly<{
  once: (
    signal: PublishingRuntimeSignal,
    listener: () => void,
  ) => unknown;
  off: (
    signal: PublishingRuntimeSignal,
    listener: () => void,
  ) => unknown;
}>;
