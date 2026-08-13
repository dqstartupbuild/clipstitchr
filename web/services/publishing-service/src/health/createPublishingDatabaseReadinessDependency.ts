import type { PrismaClient } from "@prisma/client";

import type { ReadinessDependency } from "./ReadinessDependency.js";

export const createPublishingDatabaseReadinessDependency = (
  database: PrismaClient,
): ReadinessDependency =>
  Object.freeze({
    name: "postgresql",
    async check() {
      await database.$queryRaw`SELECT 1`;
    },
  });
