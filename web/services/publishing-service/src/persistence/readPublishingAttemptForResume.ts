import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingAttemptResumeState } from "./PublishingAttemptResumeState.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const readPublishingAttemptForResume = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  attemptId: string,
): Promise<PublishingAttemptResumeState> => {
  assertPublishingPersistenceIdentifier(attemptId, "attemptId");
  const attempt = await database.clipPublishingAttempt.findFirst({
    where: {
      id: attemptId,
      tenant: { tenantKey },
    },
    include: {
      receipts: {
        where: { resultClass: "PUBLISHED" },
        take: 1,
      },
    },
  });

  if (attempt === null) {
    throw new PublishingResourceOwnershipError();
  }

  return {
    attemptId: attempt.id,
    attemptNumber: attempt.attemptNumber,
    checkpointVersion: attempt.checkpointVersion,
    checkpoint: attempt.checkpoint,
    resumeRequired: attempt.checkpointVersion > 0,
    providerCallAllowed: attempt.receipts.length === 0,
  };
};
