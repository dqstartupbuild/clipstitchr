import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { assertPublishingPersistenceIdentifier } from "../persistence/assertPublishingPersistenceIdentifier.js";
import type { PublishingOutboxDispatcherOptions } from "./PublishingOutboxDispatcherOptions.js";

export const assertPublishingOutboxDispatcherOptions = (
  options: PublishingOutboxDispatcherOptions,
): void => {
  assertPublishingPersistenceIdentifier(options.leaseOwner, "leaseOwner");

  if (
    !Number.isInteger(options.leaseLimit) ||
    options.leaseLimit < 1 ||
    options.leaseLimit > 100 ||
    !Number.isInteger(options.concurrency) ||
    options.concurrency < 1 ||
    options.concurrency > options.leaseLimit ||
    !Number.isInteger(options.leaseDurationMilliseconds) ||
    options.leaseDurationMilliseconds < 5_000 ||
    options.leaseDurationMilliseconds > 900_000 ||
    !Number.isInteger(options.maximumDeliveryAttempts) ||
    options.maximumDeliveryAttempts < 1 ||
    options.maximumDeliveryAttempts > 100
  ) {
    throw new PublishingPersistenceValidationError("outboxDispatcher");
  }
};
