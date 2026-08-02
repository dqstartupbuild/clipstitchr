import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";
import type { ProviderTokenKind } from "../tokens/ProviderTokenKind.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";
import type { PublishingProviderRefreshCallback } from "./PublishingProviderRefreshCallback.js";

export type RefreshPublishingProviderConnectionInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
  credentialKind: ProviderTokenKind;
  keyring: ProviderTokenKeyring;
  cipherKey: ProviderTokenCipherKey;
  refreshConnection: PublishingProviderRefreshCallback;
  refreshedAt?: Date;
}>;
