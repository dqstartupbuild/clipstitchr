import type { StructuredLogger } from "../logging/StructuredLogger.js";
import type { PublishingOutboxHandler } from "./PublishingOutboxHandler.js";
import type { PublishingOutboxStore } from "./PublishingOutboxStore.js";

export type PublishingOutboxDispatcherOptions = Readonly<{
  leaseOwner: string;
  leaseLimit: number;
  concurrency: number;
  leaseDurationMilliseconds: number;
  maximumDeliveryAttempts: number;
  store: PublishingOutboxStore;
  handler: PublishingOutboxHandler;
  logger: StructuredLogger;
  now?: () => Date;
}>;
