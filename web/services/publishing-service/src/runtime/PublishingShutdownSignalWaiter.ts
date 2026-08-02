import type { PublishingRuntimeSignal } from "./PublishingRuntimeSignal.js";

export type PublishingShutdownSignalWaiter = Readonly<{
  dispose: () => void;
  promise: Promise<PublishingRuntimeSignal>;
}>;
