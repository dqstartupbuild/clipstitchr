import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export type ReadTenantPublishingIntegrationInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
}>;
