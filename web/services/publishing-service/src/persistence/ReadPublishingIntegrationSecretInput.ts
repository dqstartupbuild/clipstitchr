import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";
import type { ProviderTokenKind } from "../tokens/ProviderTokenKind.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export type ReadPublishingIntegrationSecretInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
  tokenKind: ProviderTokenKind;
  keyring: ProviderTokenKeyring;
}>;
