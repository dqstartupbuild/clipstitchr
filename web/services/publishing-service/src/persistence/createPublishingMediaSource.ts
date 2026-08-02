import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@prisma/client";

import { PublishingMediaRevisionConflictError } from "../errors/PublishingMediaRevisionConflictError.js";
import type { CreatePublishingMediaSourceInput } from "./CreatePublishingMediaSourceInput.js";
import { assertPublishingDisplayName } from "./assertPublishingDisplayName.js";
import { assertPublishingMediaObjects } from "./assertPublishingMediaObjects.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { assertSafePersistenceJson } from "./assertSafePersistenceJson.js";
import { assertSha256Digest } from "./assertSha256Digest.js";
import { createDurableMediaPath } from "./createDurableMediaPath.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { isPrismaUniqueConstraintError } from "./isPrismaUniqueConstraintError.js";
import { mapPublishingSourceKind } from "./mapPublishingSourceKind.js";

export const createPublishingMediaSource = async (
  database: PrismaClient,
  input: CreatePublishingMediaSourceInput,
) => {
  assertPublishingPersistenceIdentifier(input.sourceRecordId, "sourceRecordId");
  assertSha256Digest(input.sourceRevision, "sourceRevision");
  assertSha256Digest(input.contentChecksum, "contentChecksum");
  assertPublishingDisplayName(input.displayName, "displayName");
  assertPublishingDisplayName(input.mediaType, "mediaType");
  assertSafePersistenceJson(input.compatibilityFacts, "compatibilityFacts");
  const byteLength = assertPublishingMediaObjects(input.objects);
  const sourceKind = mapPublishingSourceKind(input.sourceKind);
  const mediaSourceId = randomUUID();

  try {
    return await database.$transaction(async (transaction) => {
      const tenant = await findPublishingTenantOrThrow(
        transaction,
        input.tenantKey,
      );
      const media = await transaction.media.create({
        data: {
          name: input.displayName.trim(),
          ...(input.originalName === undefined
            ? {}
            : { originalName: input.originalName.trim() }),
          path: createDurableMediaPath(mediaSourceId),
          organizationId: tenant.organizationId,
          fileSize: byteLength,
          type: input.mediaType.trim(),
        },
      });

      return transaction.clipPublishingMediaSource.create({
        data: {
          id: mediaSourceId,
          tenantId: tenant.id,
          mediaId: media.id,
          sourceKind,
          sourceRecordId: input.sourceRecordId,
          sourceRevision: input.sourceRevision,
          contentChecksum: input.contentChecksum,
          objectManifest: input.objects as unknown as Prisma.InputJsonValue,
          mediaType: input.mediaType.trim(),
          byteLength: BigInt(byteLength),
          compatibilityFacts: input.compatibilityFacts,
        },
        include: { media: true },
      });
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    const existing = await database.clipPublishingMediaSource.findFirst({
      where: {
        tenant: { tenantKey: input.tenantKey },
        sourceKind,
        sourceRecordId: input.sourceRecordId,
        sourceRevision: input.sourceRevision,
      },
      include: { media: true },
    });

    if (
      existing === null ||
      existing.contentChecksum !== input.contentChecksum ||
      existing.byteLength !== BigInt(byteLength)
    ) {
      throw new PublishingMediaRevisionConflictError();
    }

    return existing;
  }
};
