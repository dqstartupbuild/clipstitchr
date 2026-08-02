import type { PrismaClient } from "@prisma/client";

import { PublishingOutboxLeaseError } from "../errors/PublishingOutboxLeaseError.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { ReadPublishingDestinationForDispatchInput } from "./ReadPublishingDestinationForDispatchInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";

export const readPublishingDestinationForDispatch = async (
  database: PrismaClient,
  input: ReadPublishingDestinationForDispatchInput,
) => {
  assertPublishingPersistenceIdentifier(input.outboxId, "outboxId");
  assertPublishingPersistenceIdentifier(input.leaseOwner, "leaseOwner");

  if (!Number.isSafeInteger(input.now.getTime())) {
    throw new PublishingPersistenceValidationError("now");
  }

  const outbox = await database.clipPublishingOutbox.findFirst({
    where: {
      id: input.outboxId,
      status: "LEASED",
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: { gt: input.now },
    },
    include: {
      postState: {
        include: {
          tenant: { select: { tenantKey: true } },
          post: true,
          integration: { select: publishingIntegrationSafeSelect },
          mediaSource: { include: { media: true } },
          attempts: {
            orderBy: { attemptNumber: "desc" },
            take: 1,
          },
          receipts: {
            orderBy: [{ observedAt: "desc" }, { id: "desc" }],
            take: 20,
            include: {
              publications: {
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                take: 20,
              },
            },
          },
        },
      },
    },
  });

  if (outbox === null) {
    throw new PublishingOutboxLeaseError();
  }

  return outbox;
};
