import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { ProviderTokenKind } from "../tokens/ProviderTokenKind.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export type StorePublishingIntegrationSecretInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
  tokenKind: ProviderTokenKind;
  plaintextToken: string;
  cipherKey: ProviderTokenCipherKey;
  expiresAt?: Date | null;
}>;
