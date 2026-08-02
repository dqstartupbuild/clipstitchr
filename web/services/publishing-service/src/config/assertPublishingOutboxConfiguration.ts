import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

export const assertPublishingOutboxConfiguration = (
  environment: PublishingServiceEnvironment,
): void => {
  if (environment.outboxConcurrency > environment.outboxLeaseLimit) {
    throw new PublishingServiceConfigurationError(
      "PUBLISHING_OUTBOX_CONCURRENCY",
    );
  }
};
