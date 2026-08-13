import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]", "localhost"]);

export const assertPublishingSecureOrigins = (
  environment: PublishingServiceEnvironment,
): void => {
  const origins = [
    [environment.clipStitchrPublicOrigin, "STUDIO_PUBLISHING_APP_ORIGIN"],
    [
      environment.publishingMediaPublicOrigin,
      "STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN",
    ],
    [
      environment.tikTokVerifiedMediaOrigin,
      "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
    ],
  ] as const;

  for (const [origin, fieldName] of origins) {
    if (origin === undefined) {
      continue;
    }

    const parsed = new URL(origin);
    if (
      parsed.protocol !== "https:" &&
      (environment.mode === "production" || !LOOPBACK_HOSTS.has(parsed.hostname))
    ) {
      throw new PublishingServiceConfigurationError(fieldName);
    }
  }
};
