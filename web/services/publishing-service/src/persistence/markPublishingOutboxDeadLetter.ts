import type { PrismaClient } from "@prisma/client";

import { PublishingOutboxLeaseError } from "../errors/PublishingOutboxLeaseError.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { MarkPublishingOutboxDeadLetterInput } from "./MarkPublishingOutboxDeadLetterInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const markPublishingOutboxDeadLetter = async (
  database: PrismaClient,
  input: MarkPublishingOutboxDeadLetterInput,
): Promise<void> => {
  assertPublishingPersistenceIdentifier(input.outboxId, "outboxId");
  assertPublishingPersistenceIdentifier(input.leaseOwner, "leaseOwner");
  assertPublishingPersistenceIdentifier(input.safeErrorCode, "safeErrorCode");

  if (!Number.isSafeInteger(input.deadLetteredAt.getTime())) {
    throw new PublishingPersistenceValidationError("deadLetteredAt");
  }

  const updated = await database.clipPublishingOutbox.updateMany({
    where: {
      id: input.outboxId,
      status: "LEASED",
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: { gt: input.deadLetteredAt },
    },
    data: {
      status: "DEAD_LETTER",
      leaseOwner: null,
      leaseExpiresAt: null,
      lastSafeError: input.safeErrorCode,
      deliveredAt: null,
    },
  });

  if (updated.count !== 1) {
    throw new PublishingOutboxLeaseError();
  }
};
