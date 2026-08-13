import type { PrismaClient } from "@prisma/client";

import { PublishingReceiptConflictError } from "../errors/PublishingReceiptConflictError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { RecordPublishingReceiptInput } from "./RecordPublishingReceiptInput.js";
import { assertBoundedSafePersistenceJson } from "./assertBoundedSafePersistenceJson.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { assertPublishingRemotePublications } from "./assertPublishingRemotePublications.js";
import { assertSha256Digest } from "./assertSha256Digest.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { isPrismaUniqueConstraintError } from "./isPrismaUniqueConstraintError.js";
import { mapPublishingProvider } from "./mapPublishingProvider.js";
import { mapPublishingReceiptResult } from "./mapPublishingReceiptResult.js";
import { mapPublishingReceiptStateTransition } from "./mapPublishingReceiptStateTransition.js";

export const recordPublishingReceipt = async (
  database: PrismaClient,
  input: RecordPublishingReceiptInput,
) => {
  assertPublishingPersistenceIdentifier(input.postStateId, "postStateId");
  assertPublishingPersistenceIdentifier(input.attemptId, "attemptId");
  assertSha256Digest(input.responseDigest, "responseDigest");
  assertBoundedSafePersistenceJson(input.safeMetadata, "safeMetadata", 16_000);
  assertPublishingRemotePublications(input.remotePublications, input.result);

  if (Number.isNaN(input.observedAt.getTime())) {
    throw new RangeError("observedAt must be a valid date.");
  }

  const existing = await database.clipPublishingReceipt.findFirst({
    where: {
      tenant: { tenantKey: input.tenantKey },
      postStateId: input.postStateId,
      responseDigest: input.responseDigest,
    },
    include: { publications: true },
  });

  if (existing !== null) {
    return existing;
  }

  try {
    return await database.$transaction(async (transaction) => {
      const tenant = await findPublishingTenantOrThrow(
        transaction,
        input.tenantKey,
      );
      const state = await transaction.clipPublishingPostState.findFirst({
        where: {
          id: input.postStateId,
          tenantId: tenant.id,
          integration: { providerIdentifier: input.provider },
        },
      });
      const attempt = await transaction.clipPublishingAttempt.findFirst({
        where: {
          id: input.attemptId,
          tenantId: tenant.id,
          postStateId: input.postStateId,
        },
      });

      if (state === null || attempt === null) {
        throw new PublishingResourceOwnershipError();
      }

      const providerIdentifier = mapPublishingProvider(input.provider);
      const resultClass = mapPublishingReceiptResult(input.result);
      const receipt = await transaction.clipPublishingReceipt.create({
        data: {
          tenantId: tenant.id,
          postStateId: state.id,
          attemptId: attempt.id,
          providerIdentifier,
          resultClass,
          responseDigest: input.responseDigest,
          safeMetadata: input.safeMetadata,
          observedAt: input.observedAt,
          publications: {
            create: input.remotePublications.map((publication) => ({
              tenantId: tenant.id,
              providerIdentifier,
              remotePublicationId: publication.remotePublicationId,
              ...(publication.observableUrl === undefined
                ? {}
                : { observableUrl: publication.observableUrl }),
            })),
          },
        },
        include: { publications: true },
      });
      const transition = mapPublishingReceiptStateTransition(input.result);

      await transaction.clipPublishingPostState.update({
        where: { id: state.id },
        data: {
          internalState: transition.internalState,
          disposition: transition.disposition,
        },
      });
      await transaction.post.update({
        where: { id: state.postId },
        data: { state: transition.postState },
      });
      await transaction.clipPublishingAttempt.update({
        where: { id: attempt.id },
        data: {
          status:
            input.result === "published"
              ? "SUCCEEDED"
              : input.result === "uncertain"
                ? "UNCERTAIN"
                : input.result === "canceled"
                  ? "CANCELED"
                  : input.result === "rejected"
                    ? "FAILED"
                    : "STARTED",
          finishedAt:
            input.result === "accepted-processing" ||
            input.result === "user-action-required"
              ? null
              : input.observedAt,
        },
      });

      return receipt;
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    const concurrent = await database.clipPublishingReceipt.findFirst({
      where: {
        tenant: { tenantKey: input.tenantKey },
        postStateId: input.postStateId,
        responseDigest: input.responseDigest,
      },
      include: { publications: true },
    });

    if (concurrent === null) {
      throw new PublishingReceiptConflictError();
    }

    return concurrent;
  }
};
