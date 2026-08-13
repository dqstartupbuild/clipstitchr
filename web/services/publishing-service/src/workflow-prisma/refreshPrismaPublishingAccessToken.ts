import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingWorkflowWorkItem } from "../workflow/PublishingWorkflowWorkItem.js";
import type { PrismaPublishingSafeIntegrationRecord } from "./PrismaPublishingSafeIntegrationRecord.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";

export const refreshPrismaPublishingAccessToken = async (
  context: PrismaPublishingWorkflowContext,
  item: PublishingWorkflowWorkItem,
  integration: PrismaPublishingSafeIntegrationRecord,
): Promise<void> => {
  if (
    integration.id !== item.integrationId ||
    integration.internalId !== item.accountId
  ) {
    throw new ProviderRuntimeError(item.provider, "auth_required");
  }

  if (item.provider === "instagram") {
    throw new ProviderRuntimeError(item.provider, "auth_required");
  }

  const runtime = context.providerRuntimes.get(item.provider);

  if (runtime?.id !== item.provider) {
    throw new ProviderRuntimeError(item.provider, "invalid_configuration");
  }

  try {
    await context.persistence.refreshConnection({
      tenantKey: item.tenantKey,
      integrationId: item.integrationId,
      provider: item.provider,
      credentialKind:
        item.provider === "instagram-standalone" ? "access" : "refresh",
      keyring: context.keyring,
      cipherKey: context.cipherKey,
      refreshedAt: context.now(),
      refreshConnection:
        item.provider === "instagram-standalone"
          ? (currentAccessToken) => {
              if (runtime.id !== "instagram-standalone") {
                throw new ProviderRuntimeError(
                  item.provider,
                  "invalid_configuration",
                );
              }
              return runtime.refreshConnection(currentAccessToken);
            }
          : (currentRefreshToken) => {
              if (runtime.id !== "tiktok" && runtime.id !== "youtube") {
                throw new ProviderRuntimeError(
                  item.provider,
                  "invalid_configuration",
                );
              }
              return runtime.id === "youtube"
                ? runtime.refreshConnection(
                    currentRefreshToken,
                    integration.internalId,
                  )
                : runtime.refreshConnection(currentRefreshToken);
            },
    });
  } catch (error) {
    if (error instanceof PublishingResourceOwnershipError) {
      throw new ProviderRuntimeError(item.provider, "auth_required");
    }
    throw error;
  }
};
