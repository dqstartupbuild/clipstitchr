import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";

export type CreatePublishingIntegrationInput = Readonly<{
  tenantKey: PublishingTenantKey;
  internalId: string;
  name: string;
  provider: ProviderTokenProvider;
  pictureUrl?: string | null;
  username?: string | null;
  grantedScopes?: readonly string[];
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
}>;
