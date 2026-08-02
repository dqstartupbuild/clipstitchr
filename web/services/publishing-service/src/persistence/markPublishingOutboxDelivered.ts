import type { PrismaClient } from "@prisma/client";

import { PublishingOutboxLeaseError } from "../errors/PublishingOutboxLeaseError.js";
import type { MarkPublishingOutboxDeliveredInput } from "./MarkPublishingOutboxDeliveredInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const markPublishingOutboxDelivered = async (
  database: PrismaClient,
  input: MarkPublishingOutboxDeliveredInput,
): Promise<void> => {
  assertPublishingPersistenceIdentifier(input.outboxId, "outboxId");
  assertPublishingPersistenceIdentifier(input.leaseOwner, "leaseOwner");

  const updated = await database.clipPublishingOutbox.updateMany({
    where: {
      id: input.outboxId,
      status: "LEASED",
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: { gt: input.deliveredAt },
    },
    data: {
      status: "DELIVERED",
      deliveredAt: input.deliveredAt,
      leaseOwner: null,
      leaseExpiresAt: null,
      lastSafeError: null,
    },
  });

  if (updated.count !== 1) {
    throw new PublishingOutboxLeaseError();
  }
};
