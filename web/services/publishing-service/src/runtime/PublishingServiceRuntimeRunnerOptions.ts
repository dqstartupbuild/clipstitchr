import type { StructuredLogger } from "../logging/StructuredLogger.js";
import type { PublishingRuntimeSignalSource } from "./PublishingRuntimeSignalSource.js";

export type PublishingServiceRuntimeRunnerOptions = Readonly<{
  logger: StructuredLogger;
  shutdownTimeoutMilliseconds?: number;
  signalSource?: PublishingRuntimeSignalSource;
}>;
