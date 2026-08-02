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
    throw new PublishingServiceConfigurationError("META_GRAPH_API_VERSION");
  }

  if (
    environment.enabledProviders.includes("instagram") &&
    (environment.facebookAppId === undefined ||
      environment.facebookAppSecret === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.facebookAppId === undefined
        ? "FACEBOOK_APP_ID"
        : "FACEBOOK_APP_SECRET",
    );
  }

  if (
    environment.enabledProviders.includes("instagram-standalone") &&
    (environment.instagramAppId === undefined ||
      environment.instagramAppSecret === undefined)
  ) {
    throw new PublishingServiceConfigurationError(
      environment.instagramAppId === undefined
        ? "INSTAGRAM_APP_ID"
        : "INSTAGRAM_APP_SECRET",
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
        ? "TIKTOK_CLIENT_ID"
        : environment.tikTokClientSecret === undefined
          ? "TIKTOK_CLIENT_SECRET"
          : "TIKTOK_VERIFIED_MEDIA_ORIGIN",
    );
  }

  if (
    environment.enabledProviders.includes("tiktok") &&
    environment.tikTokVerifiedMediaOrigin !==
      environment.publishingMediaPublicOrigin
  ) {
    throw new PublishingServiceConfigurationError(
      "TIKTOK_VERIFIED_MEDIA_ORIGIN",
    );
  }
};
