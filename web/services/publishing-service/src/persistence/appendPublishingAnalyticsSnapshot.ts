import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { AppendPublishingAnalyticsSnapshotInput } from "./AppendPublishingAnalyticsSnapshotInput.js";
import { assertBoundedSafePersistenceJson } from "./assertBoundedSafePersistenceJson.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";

export const appendPublishingAnalyticsSnapshot = async (
  database: PrismaClient,
  input: AppendPublishingAnalyticsSnapshotInput,
) => {
  if (
    input.integrationId === undefined &&
    input.postStateId === undefined &&
    input.receiptId === undefined
  ) {
    throw new PublishingPersistenceValidationError("analyticsSubject");
  }

  if (input.integrationId !== undefined) {
    assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  }
  if (input.postStateId !== undefined) {
    assertPublishingPersistenceIdentifier(input.postStateId, "postStateId");
  }
  if (input.receiptId !== undefined) {
    assertPublishingPersistenceIdentifier(input.receiptId, "receiptId");
  }
  assertBoundedSafePersistenceJson(input.metrics, "metrics", 32_000);

  if (
    Number.isNaN(input.metricWindowStart.getTime()) ||
    Number.isNaN(input.metricWindowEnd.getTime()) ||
    Number.isNaN(input.observedAt.getTime()) ||
    input.metricWindowEnd < input.metricWindowStart
  ) {
    throw new PublishingPersistenceValidationError("metricWindow");
  }

  return database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction,
      input.tenantKey,
    );
    const integration =
      input.integrationId === undefined
        ? null
        : await transaction.integration.findFirst({
            where: {
              id: input.integrationId,
              organizationId: tenant.organizationId,
            },
            select: { id: true },
          });
    const postState =
      input.postStateId === undefined
        ? null
        : await transaction.clipPublishingPostState.findFirst({
            where: { id: input.postStateId, tenantId: tenant.id },
            select: { id: true, integrationId: true },
          });
    const receipt =
      input.receiptId === undefined
        ? null
        : await transaction.clipPublishingReceipt.findFirst({
            where: { id: input.receiptId, tenantId: tenant.id },
            select: { id: true, postStateId: true },
          });

    if (
      (input.integrationId !== undefined && integration === null) ||
      (input.postStateId !== undefined && postState === null) ||
      (input.receiptId !== undefined && receipt === null) ||
      (integration !== null &&
        postState !== null &&
        postState.integrationId !== integration.id) ||
      (postState !== null &&
        receipt !== null &&
        receipt.postStateId !== postState.id)
    ) {
      throw new PublishingResourceOwnershipError();
    }

    return transaction.clipPublishingAnalyticsSnapshot.create({
      data: {
        tenantId: tenant.id,
        ...(integration === null ? {} : { integrationId: integration.id }),
        ...(postState === null ? {} : { postStateId: postState.id }),
        ...(receipt === null ? {} : { receiptId: receipt.id }),
        metricWindowStart: input.metricWindowStart,
        metricWindowEnd: input.metricWindowEnd,
        observedAt: input.observedAt,
        metrics: input.metrics,
      },
    });
  });
};
