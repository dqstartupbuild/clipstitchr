import type { PrismaClient } from "@prisma/client";

import { PublishingApiConflictError } from "./PublishingApiConflictError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { readPublishingIntegrationSecret } from "../persistence/readPublishingIntegrationSecret.js";
import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";
import type { PublishingApiAnalyticsRefreshTarget } from "./PublishingApiAnalyticsRefreshTarget.js";

export const preparePrismaPublishingApiAnalyticsRefresh = async (
  database: PrismaClient,
  keyring: ProviderTokenKeyring,
  tenantKey: PublishingTenantKey,
  postId: string,
): Promise<PublishingApiAnalyticsRefreshTarget> => {
  const state = await database.clipPublishingPostState.findFirst({
    where: {
      postId,
      tenant: { tenantKey },
      disposition: "TERMINAL",
      internalState: "PUBLISHED",
      post: { deletedAt: null, state: "PUBLISHED" },
      integration: { deletedAt: null },
    },
    include: {
      integration: true,
      receipts: {
        where: { resultClass: "PUBLISHED" },
        orderBy: [{ observedAt: "desc" }, { id: "desc" }],
        take: 20,
        include: {
          publications: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 20,
          },
        },
      },
    },
  });
  if (state === null) {
    throw new PublishingResourceOwnershipError();
  }
  if (state.integration.disabled || state.integration.refreshNeeded) {
    throw new PublishingApiConflictError("connection_needs_attention");
  }
  const provider = state.integration.providerIdentifier;
  if (
    provider !== "instagram" &&
    provider !== "instagram-standalone" &&
    provider !== "tiktok"
  ) {
    throw new PublishingResourceOwnershipError();
  }
  const receipt = state.receipts.find(({ publications }) => publications.length > 0);
  const publication = receipt?.publications[0];
  if (receipt === undefined || publication === undefined) {
    throw new PublishingApiConflictError("analytics_unavailable");
  }
  const accessToken = await readPublishingIntegrationSecret(database, {
    tenantKey,
    integrationId: state.integrationId,
    provider,
    tokenKind: "access",
    keyring,
  });
  if (accessToken === null) {
    throw new PublishingApiConflictError("connection_needs_attention");
  }
  return Object.freeze({
    accessToken,
    integrationId: state.integrationId,
    postId: state.postId,
    postStateId: state.id,
    provider,
    receiptId: receipt.id,
    remotePublicationId: publication.remotePublicationId,
  });
};
