import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";

export const assertProductionProviderConfigurationComplete = (
  environment: PublishingServiceEnvironment,
): void => {
  if (environment.mode !== "production") {
    return;
  }

  if (
    (environment.enabledProviders.includes("instagram") ||
      environment.enabledProviders.includes("instagram-standalone")) &&
    environment.metaGraphVersion === undefined
  ) {
    throw new PublishingServiceConfigurationError("STUDIO_PUBLISHING_META_GRAPH_API_VERSION");
  }

  if (
    environment.enabledProviders.includes("instagram") &&
    (environment.facebookAppId === undefined ||
      environment.facebookAppSecret === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.facebookAppId === undefined
        ? "STUDIO_PUBLISHING_META_APP_ID"
        : "STUDIO_PUBLISHING_META_APP_SECRET",
    );
  }

  if (
    environment.enabledProviders.includes("instagram-standalone") &&
    (environment.instagramAppId === undefined ||
      environment.instagramAppSecret === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.instagramAppId === undefined
        ? "STUDIO_PUBLISHING_INSTAGRAM_APP_ID"
        : "STUDIO_PUBLISHING_INSTAGRAM_APP_SECRET",
    );
  }

  if (
    environment.enabledProviders.includes("tiktok") &&
    (environment.tikTokClientId === undefined ||
      environment.tikTokClientSecret === undefined ||
      environment.tikTokVerifiedMediaOrigin === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.tikTokClientId === undefined
        ? "STUDIO_PUBLISHING_TIKTOK_CLIENT_ID"
        : environment.tikTokClientSecret === undefined
          ? "STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET"
          : "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
    );
  }

  if (
    environment.enabledProviders.includes("tiktok") &&
    environment.tikTokVerifiedMediaOrigin !==
      environment.publishingMediaPublicOrigin
  ) {
    throw new PublishingServiceConfigurationError(
      "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
    );
  }

  if (
    environment.enabledProviders.includes("youtube") &&
    (environment.googleClientId === undefined ||
      environment.googleClientSecret === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.googleClientId === undefined
        ? "STUDIO_PUBLISHING_GOOGLE_CLIENT_ID"
        : "STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET",
    );
  }
};
