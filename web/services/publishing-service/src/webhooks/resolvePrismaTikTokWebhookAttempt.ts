import type { PrismaClient } from "@prisma/client";

import { createSafePublishingProviderOperationReference } from "../workflow-prisma/createSafePublishingProviderOperationReference.js";
import { parsePublishingWorkflowTenantKey } from "../workflow-prisma/parsePublishingWorkflowTenantKey.js";
import type { TikTokWebhookAttempt } from "./TikTokWebhookAttempt.js";

export const resolvePrismaTikTokWebhookAttempt = async (
  database: PrismaClient,
  publishId: string,
): Promise<TikTokWebhookAttempt | null> => {
  const providerOperationId =
    createSafePublishingProviderOperationReference("tiktok", publishId);
  if (providerOperationId === null) {
    return null;
  }

  const matches = await database.clipPublishingAttempt.findMany({
    where: {
      finishedAt: null,
      providerOperationId,
      providerOperationKind: "TIKTOK_PUBLISH",
      status: "STARTED",
      postState: {
        disposition: "ACTIVE",
        integration: {
          deletedAt: null,
          providerIdentifier: "tiktok",
        },
        internalState: { in: ["DISPATCHING", "PROCESSING"] },
      },
    },
    select: {
      id: true,
      postStateId: true,
      tenantId: true,
      tenant: {
        select: { organizationId: true, tenantKey: true },
      },
      postState: {
        select: {
          integrationId: true,
          tenantId: true,
          integration: { select: { id: true, organizationId: true } },
          post: {
            select: { integrationId: true, organizationId: true },
          },
        },
      },
    },
    take: 2,
  });
  const match = matches[0];
  if (matches.length !== 1 || match === undefined) {
    return null;
  }
  if (
    match.tenantId !== match.postState.tenantId ||
    match.tenant.organizationId !== match.postState.integration.organizationId ||
    match.tenant.organizationId !== match.postState.post.organizationId ||
    match.postState.integrationId !== match.postState.integration.id ||
    match.postState.integrationId !== match.postState.post.integrationId
  ) {
    return null;
  }

  try {
    return Object.freeze({
      attemptId: match.id,
      postStateId: match.postStateId,
      tenantId: match.tenantId,
      tenantKey: parsePublishingWorkflowTenantKey(match.tenant.tenantKey),
    });
  } catch {
    return null;
  }
};
