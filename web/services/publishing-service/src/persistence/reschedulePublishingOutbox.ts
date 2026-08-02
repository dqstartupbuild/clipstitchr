import type { PrismaClient } from "@prisma/client";

import { PublishingOutboxLeaseError } from "../errors/PublishingOutboxLeaseError.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { ReschedulePublishingOutboxInput } from "./ReschedulePublishingOutboxInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const reschedulePublishingOutbox = async (
  database: PrismaClient,
  input: ReschedulePublishingOutboxInput,
): Promise<void> => {
  assertPublishingPersistenceIdentifier(input.outboxId, "outboxId");
  assertPublishingPersistenceIdentifier(input.leaseOwner, "leaseOwner");
  assertPublishingPersistenceIdentifier(input.safeErrorCode, "safeErrorCode");

  if (
    !Number.isSafeInteger(input.availableAt.getTime()) ||
    !Number.isSafeInteger(input.rescheduledAt.getTime()) ||
    input.availableAt < input.rescheduledAt
  ) {
    throw new PublishingPersistenceValidationError("outboxReschedule");
  }

  const updated = await database.clipPublishingOutbox.updateMany({
    where: {
      id: input.outboxId,
      status: "LEASED",
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: { gt: input.rescheduledAt },
    },
    data: {
      status: "PENDING",
      availableAt: input.availableAt,
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
