import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { MissingRefreshTokenPolicy } from "./MissingRefreshTokenPolicy.js";

export type UpsertPublishingProviderConnectionsInput = Readonly<{
  tenantKey: PublishingTenantKey;
  connections: readonly ProviderConnection[];
  cipherKey: ProviderTokenCipherKey;
  connectedAt?: Date;
  missingRefreshTokenPolicy?: MissingRefreshTokenPolicy;
}>;
