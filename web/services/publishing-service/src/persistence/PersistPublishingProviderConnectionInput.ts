import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { MissingRefreshTokenPolicy } from "./MissingRefreshTokenPolicy.js";

export type PersistPublishingProviderConnectionInput = Readonly<{
  transaction: Prisma.TransactionClient;
  tenantId: string;
  organizationId: string;
  tenantKey: PublishingTenantKey;
  connection: ProviderConnection;
  cipherKey: ProviderTokenCipherKey;
  connectedAt: Date;
  missingRefreshTokenPolicy: MissingRefreshTokenPolicy;
}>;
