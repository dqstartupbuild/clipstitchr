import { PrismaClient } from "@prisma/client";

export const createPublishingPrismaClient = (
  databaseUrl: string,
): PrismaClient =>
  new PrismaClient({
    datasourceUrl: databaseUrl,
  });
