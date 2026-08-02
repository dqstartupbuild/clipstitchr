import { Prisma } from "@prisma/client";

export const acquirePublishingAdvisoryLock = async (
  transaction: Prisma.TransactionClient,
  lockKey: string,
): Promise<void> => {
  await transaction.$executeRaw(
    Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
  );
};
