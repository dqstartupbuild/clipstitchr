import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { readTenantPublishingIntegration } from "../persistence/readTenantPublishingIntegration.js";
import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";

const PROVIDERS = ["instagram-standalone", "instagram", "tiktok"] as const;

export const readOwnedPublishingIntegration = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  integrationId: string,
): Promise<PublishingIntegrationRecord> => {
  for (const provider of PROVIDERS) {
    try {
      return await readTenantPublishingIntegration(database, {
        tenantKey,
        integrationId,
        provider,
      });
    } catch (error) {
      if (!(error instanceof PublishingResourceOwnershipError)) {
        throw error;
      }
    }
  }

  throw new PublishingResourceOwnershipError();
};
