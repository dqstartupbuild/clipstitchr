import { Prisma, type PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { LeasePublishingOutboxInput } from "./LeasePublishingOutboxInput.js";
import type { LeasedPublishingOutboxRecord } from "./LeasedPublishingOutboxRecord.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const leasePublishingOutbox = async (
  database: PrismaClient,
  input: LeasePublishingOutboxInput,
): Promise<readonly LeasedPublishingOutboxRecord[]> => {
  assertPublishingPersistenceIdentifier(input.leaseOwner, "leaseOwner");

  if (
    !Number.isInteger(input.limit) ||
    input.limit < 1 ||
    input.limit > 100 ||
    !Number.isInteger(input.leaseDurationMilliseconds) ||
    input.leaseDurationMilliseconds < 1_000 ||
    input.leaseDurationMilliseconds > 900_000 ||
    Number.isNaN(input.now.getTime())
  ) {
    throw new PublishingPersistenceValidationError("outboxLease");
  }

  const leaseExpiresAt = new Date(
    input.now.getTime() + input.leaseDurationMilliseconds,
  );

  return database.$queryRaw<LeasedPublishingOutboxRecord[]>(Prisma.sql`
    WITH candidates AS (
      SELECT outbox."id"
      FROM "ClipPublishingOutbox" outbox
      WHERE outbox."availableAt" <= ${input.now}
        AND (
          outbox."status" = 'PENDING'::"ClipPublishingOutboxStatus"
          OR (
            outbox."status" = 'LEASED'::"ClipPublishingOutboxStatus"
            AND outbox."leaseExpiresAt" <= ${input.now}
          )
        )
      ORDER BY outbox."availableAt" ASC, outbox."createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${input.limit}
    )
    UPDATE "ClipPublishingOutbox" outbox
    SET
      "status" = 'LEASED'::"ClipPublishingOutboxStatus",
      "leaseOwner" = ${input.leaseOwner},
      "leaseExpiresAt" = ${leaseExpiresAt},
      "deliveryAttempts" = outbox."deliveryAttempts" + 1,
      "updatedAt" = ${input.now}
    FROM candidates
    WHERE outbox."id" = candidates."id"
    RETURNING
      outbox."id",
      outbox."tenantId",
      outbox."postStateId",
      outbox."workflowId",
      outbox."eventType",
      outbox."eventVersion",
      outbox."payload",
      outbox."status",
      outbox."availableAt",
      outbox."leaseOwner",
      outbox."leaseExpiresAt",
      outbox."deliveryAttempts",
      outbox."createdAt",
      outbox."updatedAt"
  `);
};
