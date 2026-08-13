import type { Prisma } from "@prisma/client";

import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { ProviderTokenKind } from "../tokens/ProviderTokenKind.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export type RotatePublishingIntegrationSecretInput = Readonly<{
  transaction: Prisma.TransactionClient;
  tenantId: string;
  tenantKey: PublishingTenantKey;
  integrationId: string;
  provider: ProviderTokenProvider;
  tokenKind: ProviderTokenKind;
  plaintextToken: string;
  cipherKey: ProviderTokenCipherKey;
  expiresAt: Date | null;
  createdAt: Date;
}>;
