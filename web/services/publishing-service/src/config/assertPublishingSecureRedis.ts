import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

export const assertPublishingSecureRedis = (
  environment: PublishingServiceEnvironment,
): void => {
  if (
    environment.mode === "production" &&
    environment.redisUrl !== undefined &&
    new URL(environment.redisUrl).protocol !== "rediss:"
  ) {
    throw new PublishingServiceConfigurationError("STUDIO_PUBLISHING_REDIS_URL");
  }
};
