import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { disconnectPublishingIntegration } from "../persistence/disconnectPublishingIntegration.js";
import { listTenantIntegrations } from "../persistence/listTenantIntegrations.js";
import { readPublishingIntegrationSecret } from "../persistence/readPublishingIntegrationSecret.js";
import { refreshPublishingProviderConnection as refreshPersistedConnection } from "../persistence/refreshPublishingProviderConnection.js";
import { resolveOrCreatePublishingTenant } from "../persistence/resolveOrCreatePublishingTenant.js";
import { upsertPublishingProviderConnections } from "../persistence/upsertPublishingProviderConnections.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";
import type { PublishingIntegrationConnectionStore } from "./PublishingIntegrationConnectionStore.js";
import type { PrismaPublishingIntegrationConnectionStoreOptions } from "./PrismaPublishingIntegrationConnectionStoreOptions.js";
import { readOwnedPublishingIntegration } from "./readOwnedPublishingIntegration.js";

export const createPrismaPublishingIntegrationConnectionStore = (
  options: PrismaPublishingIntegrationConnectionStoreOptions,
): PublishingIntegrationConnectionStore => ({
  async ensureTenant(identity) {
    await resolveOrCreatePublishingTenant(options.database, {
      tenantKey: identity.tenantKey,
      organizationName:
        identity.kind === "organization"
          ? "Organization publishing workspace"
          : "Personal publishing workspace",
    });
  },

  list(tenantKey) {
    return listTenantIntegrations(options.database, tenantKey, { limit: 100 });
  },

  async saveConnections(tenantKey, connections) {
    await upsertPublishingProviderConnections(options.database, {
      tenantKey,
      connections,
      cipherKey: options.cipherKey,
    });
  },

  async refreshConnection(tenantKey, integrationId, refresh) {
    const integration = await readOwnedPublishingIntegration(
      options.database,
      tenantKey,
      integrationId,
    );
    const provider = integration.providerIdentifier;

    if (provider === "instagram") {
      await refresh({ integration, accessToken: null, refreshToken: null });
      return;
    }

    if (
      provider !== "instagram-standalone" &&
      provider !== "tiktok" &&
      provider !== "youtube"
    ) {
      throw new PublishingResourceOwnershipError();
    }

    const credentialKind =
      provider === "tiktok" || provider === "youtube" ? "refresh" : "access";

    await refreshPersistedConnection(options.database, {
      tenantKey,
      integrationId,
      provider,
      credentialKind,
      keyring: options.keyring,
      cipherKey: options.cipherKey,
      refreshConnection: (plaintextCredential) =>
        refresh({
          integration,
          accessToken:
            credentialKind === "access" ? plaintextCredential : null,
          refreshToken:
            credentialKind === "refresh" ? plaintextCredential : null,
        }),
    });
  },

  async disconnect(identity, integrationId, requestId) {
    const integration = await readOwnedPublishingIntegration(
      options.database,
      identity.tenantKey,
      integrationId,
    );
    const provider = integration.providerIdentifier;

    if (
      provider !== "instagram" &&
      provider !== "instagram-standalone" &&
      provider !== "tiktok" &&
      provider !== "youtube"
    ) {
      throw new PublishingResourceOwnershipError();
    }

    await disconnectPublishingIntegration(options.database, {
      tenantKey: identity.tenantKey,
      integrationId,
      provider,
      actorClerkUserId: identity.actorUserId,
      requestId,
    });
  },

  async readAccessToken(tenantKey, integrationId, expectedProvider) {
    const provider = expectedProvider as ProviderTokenProvider;
    await readOwnedPublishingIntegration(
      options.database,
      tenantKey,
      integrationId,
    ).then((integration) => {
      if (integration.providerIdentifier !== provider) {
        throw new PublishingResourceOwnershipError();
      }
    });

    return readPublishingIntegrationSecret(options.database, {
      tenantKey,
      integrationId,
      provider: provider as PublishingProvider,
      tokenKind: "access",
      keyring: options.keyring,
    });
  },
});
