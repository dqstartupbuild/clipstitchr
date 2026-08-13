import type { OAuthAuthorizationStateStore } from "../oauth/OAuthAuthorizationStateStore.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingIntegrationConnectionStore } from "./PublishingIntegrationConnectionStore.js";
import type { PublishingIntegrationRuntime } from "./PublishingIntegrationRuntime.js";

export type PublishingIntegrationRouteDependencies = Readonly<{
  connectionStore: PublishingIntegrationConnectionStore;
  now?: () => Date;
  oauthStateStore: OAuthAuthorizationStateStore;
  publicOrigin: string;
  runtimes: ReadonlyMap<PublishingProvider, PublishingIntegrationRuntime>;
}>;
