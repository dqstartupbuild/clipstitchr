import type { PublishingServiceEnvironment } from "../../config/PublishingServiceEnvironment.js";
import { PublishingServiceConfigurationError } from "../../errors/PublishingServiceConfigurationError.js";
import { FetchProviderHttpClient } from "../http/FetchProviderHttpClient.js";
import { InstagramFacebookProviderAdapter } from "../instagram/InstagramFacebookProviderAdapter.js";
import { InstagramPublishingClient } from "../instagram/InstagramPublishingClient.js";
import { InstagramStandaloneProviderAdapter } from "../instagram/InstagramStandaloneProviderAdapter.js";
import type { TikTokPullMediaVerifier } from "../tiktok/TikTokPullMediaVerifier.js";
import { TikTokProviderAdapter } from "../tiktok/TikTokProviderAdapter.js";
import type { PublishingProviderRuntime } from "./PublishingProviderRuntime.js";
import { providerHttpOrigins } from "./providerHttpOrigins.js";

export const createPublishingProviderRuntimes = (
  environment: PublishingServiceEnvironment,
  verifyTikTokPullMediaUrl: TikTokPullMediaVerifier,
): readonly PublishingProviderRuntime[] => {
  const http = new FetchProviderHttpClient(providerHttpOrigins);
  const runtimes: PublishingProviderRuntime[] = [];
  const graphVersion = environment.metaGraphVersion;

  if (environment.enabledProviders.includes("instagram")) {
    if (
      graphVersion === undefined ||
      environment.facebookAppId === undefined ||
      environment.facebookAppSecret === undefined
    ) {
      throw new PublishingServiceConfigurationError("FACEBOOK_APP_ID");
    }
    runtimes.push(
      new InstagramFacebookProviderAdapter({
        appId: environment.facebookAppId,
        appSecret: environment.facebookAppSecret,
        graphVersion,
        http,
        publishing: new InstagramPublishingClient({
          provider: "instagram",
          graphHost: "graph.facebook.com",
          graphVersion,
          http,
        }),
      }),
    );
  }

  if (environment.enabledProviders.includes("instagram-standalone")) {
    if (
      graphVersion === undefined ||
      environment.instagramAppId === undefined ||
      environment.instagramAppSecret === undefined
    ) {
      throw new PublishingServiceConfigurationError("INSTAGRAM_APP_ID");
    }
    runtimes.push(
      new InstagramStandaloneProviderAdapter({
        appId: environment.instagramAppId,
        appSecret: environment.instagramAppSecret,
        graphVersion,
        http,
        publishing: new InstagramPublishingClient({
          provider: "instagram-standalone",
          graphHost: "graph.instagram.com",
          graphVersion,
          http,
        }),
      }),
    );
  }

  if (environment.enabledProviders.includes("tiktok")) {
    if (
      environment.tikTokClientId === undefined ||
      environment.tikTokClientSecret === undefined ||
      environment.tikTokVerifiedMediaOrigin === undefined
    ) {
      throw new PublishingServiceConfigurationError("TIKTOK_CLIENT_ID");
    }
    runtimes.push(
      new TikTokProviderAdapter({
        clientId: environment.tikTokClientId,
        clientSecret: environment.tikTokClientSecret,
        http,
        verifiedMediaOrigin: environment.tikTokVerifiedMediaOrigin,
        verifyPullMediaUrl: verifyTikTokPullMediaUrl,
      }),
    );
  }

  return Object.freeze(runtimes);
};
