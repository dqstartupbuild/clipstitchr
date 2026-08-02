import type { readTenantPublishingIntegration } from "../persistence/readTenantPublishingIntegration.js";

export type PrismaPublishingSafeIntegrationRecord = Awaited<
  ReturnType<typeof readTenantPublishingIntegration>
>;
