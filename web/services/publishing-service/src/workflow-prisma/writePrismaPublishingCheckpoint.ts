import type { Prisma } from "@prisma/client";

import { PublishingCheckpointConflictError } from "../errors/PublishingCheckpointConflictError.js";
import type { PublishingWorkflowPort } from "../workflow/PublishingWorkflowPort.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";
import { createSafePublishingProviderOperationReference } from "./createSafePublishingProviderOperationReference.js";

export const writePrismaPublishingCheckpoint = async (
  context: PrismaPublishingWorkflowContext,
  input: Parameters<PublishingWorkflowPort["writeCheckpoint"]>[0],
): Promise<number> => {
  const updated = await context.persistence.writeCheckpoint({
    tenantKey: input.item.tenantKey,
    attemptId: input.item.attemptId,
    expectedVersion: input.expectedVersion,
    checkpoint: input.checkpoint as Prisma.InputJsonObject,
    providerOperationKind: input.providerOperationKind,
    providerOperationId:
      createSafePublishingProviderOperationReference(
        input.item.provider,
        input.providerOperationId,
      ) ?? input.providerOperationId,
    checkpointedAt: input.checkpointedAt,
  });

  if (updated.checkpointVersion !== input.expectedVersion + 1) {
    throw new PublishingCheckpointConflictError();
  }

  return updated.checkpointVersion;
};
