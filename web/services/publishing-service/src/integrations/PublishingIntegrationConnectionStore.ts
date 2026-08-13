import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";
import type { PublishingIntegrationRefreshCredentials } from "./PublishingIntegrationRefreshCredentials.js";

export interface PublishingIntegrationConnectionStore {
  ensureTenant(identity: ClerkTenantIdentity): Promise<void>;
  list(tenantKey: PublishingTenantKey): Promise<readonly PublishingIntegrationRecord[]>;
  saveConnections(
    tenantKey: PublishingTenantKey,
    connections: readonly ProviderConnection[],
  ): Promise<void>;
  refreshConnection(
    tenantKey: PublishingTenantKey,
    integrationId: string,
    refresh: (
      credentials: PublishingIntegrationRefreshCredentials,
    ) => Promise<ProviderConnection>,
  ): Promise<void>;
  disconnect(
    identity: ClerkTenantIdentity,
    integrationId: string,
    requestId: string,
  ): Promise<void>;
  readAccessToken(
    tenantKey: PublishingTenantKey,
    integrationId: string,
    expectedProvider: PublishingProvider,
  ): Promise<string | null>;
}
