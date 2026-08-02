import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { InstagramAccountSelection } from "../provider-runtime/instagram/InstagramAccountSelection.js";
import type { TikTokCreatorInfo } from "../provider-runtime/tiktok/TikTokCreatorInfo.js";

type PublishingIntegrationRuntimeBase<
  Provider extends "instagram" | "instagram-standalone" | "tiktok",
> = Readonly<{
  id: Provider;
  createAuthorizationUrl: (state: string, redirectUri: string) => string;
  exchangeAuthorizationCode: (
    code: string,
    redirectUri: string,
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

export type PublishingIntegrationRuntime =
  | InstagramFacebookIntegrationRuntime
  | InstagramStandaloneIntegrationRuntime
  | TikTokIntegrationRuntime;
