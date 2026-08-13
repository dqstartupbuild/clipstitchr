import type { PrismaClient } from "@prisma/client";

import { PublishingCheckpointConflictError } from "../errors/PublishingCheckpointConflictError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingAttemptCheckpointInput } from "./PublishingAttemptCheckpointInput.js";
import { assertBoundedSafePersistenceJson } from "./assertBoundedSafePersistenceJson.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { mapPublishingProviderOperationKind } from "./mapPublishingProviderOperationKind.js";

export const writePublishingAttemptCheckpoint = async (
  database: PrismaClient,
  input: PublishingAttemptCheckpointInput,
) => {
  assertPublishingPersistenceIdentifier(input.attemptId, "attemptId");
  assertPublishingPersistenceIdentifier(
    input.providerOperationId,
    "providerOperationId",
  );
  assertBoundedSafePersistenceJson(input.checkpoint, "checkpoint", 16_000);

  if (
    !Number.isInteger(input.expectedVersion) ||
    input.expectedVersion < 0 ||
    Number.isNaN(input.checkpointedAt.getTime())
  ) {
    throw new PublishingCheckpointConflictError();
  }

  const tenant = await findPublishingTenantOrThrow(database, input.tenantKey);
  const ownedAttempt = await database.clipPublishingAttempt.findFirst({
    where: { id: input.attemptId, tenantId: tenant.id },
    select: { id: true },
  });

  if (ownedAttempt === null) {
    throw new PublishingResourceOwnershipError();
  }

  const updated = await database.clipPublishingAttempt.updateMany({
    where: {
      id: input.attemptId,
      tenantId: tenant.id,
      checkpointVersion: input.expectedVersion,
    },
    data: {
      status: "STARTED",
      checkpointVersion: { increment: 1 },
      checkpoint: input.checkpoint,
      checkpointedAt: input.checkpointedAt,
      providerOperationKind: mapPublishingProviderOperationKind(
        input.providerOperationKind,
      ),
      providerOperationId: input.providerOperationId,
      startedAt: input.checkpointedAt,
    },
  });

  if (updated.count !== 1) {
    throw new PublishingCheckpointConflictError();
  }

  return database.clipPublishingAttempt.findUniqueOrThrow({
    where: { id: input.attemptId },
  });
};
