import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingWorkflowWorkItem } from "../workflow/PublishingWorkflowWorkItem.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";
import { refreshPrismaPublishingAccessToken } from "./refreshPrismaPublishingAccessToken.js";
import { shouldProactivelyRefreshPublishingAccessToken } from "./shouldProactivelyRefreshPublishingAccessToken.js";

export const readPrismaPublishingAccessToken = async (
  context: PrismaPublishingWorkflowContext,
  item: PublishingWorkflowWorkItem,
): Promise<string> => {
  let integration: Awaited<
    ReturnType<
      PrismaPublishingWorkflowContext["persistence"]["readIntegration"]
    >
  >;

  try {
    integration = await context.persistence.readIntegration({
      tenantKey: item.tenantKey,
      integrationId: item.integrationId,
      provider: item.provider,
    });
  } catch (error) {
    if (error instanceof PublishingResourceOwnershipError) {
      throw new ProviderRuntimeError(item.provider, "auth_required");
    }
    throw error;
  }

  const now = context.now();

  if (
    integration.id !== item.integrationId ||
    integration.internalId !== item.accountId ||
    integration.providerIdentifier !== item.provider ||
    integration.type !== item.provider ||
    integration.disabled ||
    !Number.isSafeInteger(now.getTime()) ||
    (integration.tokenExpiration !== null &&
      !Number.isSafeInteger(integration.tokenExpiration.getTime()))
  ) {
    throw new ProviderRuntimeError(item.provider, "auth_required");
  }

  const expired =
    integration.tokenExpiration !== null &&
    integration.tokenExpiration.getTime() <= now.getTime();

  if (item.provider === "instagram") {
    if (integration.refreshNeeded || expired) {
      throw new ProviderRuntimeError(item.provider, "auth_required");
    }
  } else if (shouldProactivelyRefreshPublishingAccessToken(integration, now)) {
    await refreshPrismaPublishingAccessToken(context, item, integration);
  }

  let accessToken: string | null;

  try {
    accessToken = await context.persistence.readSecret({
      tenantKey: item.tenantKey,
      integrationId: item.integrationId,
      provider: item.provider,
      tokenKind: "access",
      keyring: context.keyring,
    });
  } catch (error) {
    if (error instanceof PublishingResourceOwnershipError) {
      throw new ProviderRuntimeError(item.provider, "auth_required");
    }
    throw error;
  }

  if (accessToken === null || accessToken.length === 0) {
    throw new ProviderRuntimeError(item.provider, "auth_required");
  }

  return accessToken;
};
