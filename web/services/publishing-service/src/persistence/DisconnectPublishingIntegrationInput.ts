import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export type DisconnectPublishingIntegrationInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
  actorClerkUserId: string;
  requestId: string;
  disconnectedAt?: Date;
}>;
