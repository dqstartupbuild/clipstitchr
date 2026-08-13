import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { InstagramAccountSelection } from "../provider-runtime/instagram/InstagramAccountSelection.js";
import type { TikTokCreatorInfo } from "../provider-runtime/tiktok/TikTokCreatorInfo.js";

type PublishingIntegrationRuntimeBase<
  Provider extends "instagram" | "instagram-standalone" | "tiktok" | "youtube",
> = Readonly<{
  id: Provider;
  pkceMode?: "none" | "rfc7636-s256";
  createAuthorizationUrl: (
    state: string,
    redirectUri: string,
    pkce?: Readonly<{ codeChallenge: string; codeChallengeMethod: "S256" }>,
  ) => string;
  exchangeAuthorizationCode: (
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ) => Promise<ProviderConnection>;
}>;

type InstagramFacebookIntegrationRuntime =
  PublishingIntegrationRuntimeBase<"instagram"> &
    Readonly<{
      listInstagramAccounts: (
        userAccessToken: string,
      ) => Promise<readonly InstagramAccountSelection[]>;
    }>;

type InstagramStandaloneIntegrationRuntime =
  PublishingIntegrationRuntimeBase<"instagram-standalone"> &
    Readonly<{
      refreshConnection: (accessToken: string) => Promise<ProviderConnection>;
    }>;

type TikTokIntegrationRuntime =
  PublishingIntegrationRuntimeBase<"tiktok"> &
    Readonly<{
      refreshConnection: (refreshToken: string) => Promise<ProviderConnection>;
      getCreatorInfo: (accessToken: string) => Promise<TikTokCreatorInfo>;
    }>;

type YouTubeIntegrationRuntime =
  PublishingIntegrationRuntimeBase<"youtube"> &
    Readonly<{
      refreshConnection: (
        refreshToken: string,
        expectedChannelId?: string,
      ) => Promise<ProviderConnection>;
      listYouTubeChannels: (
        connection: ProviderConnection,
      ) => Promise<readonly ProviderConnection[]>;
    }>;

export type PublishingIntegrationRuntime =
  | InstagramFacebookIntegrationRuntime
  | InstagramStandaloneIntegrationRuntime
  | TikTokIntegrationRuntime
  | YouTubeIntegrationRuntime;
