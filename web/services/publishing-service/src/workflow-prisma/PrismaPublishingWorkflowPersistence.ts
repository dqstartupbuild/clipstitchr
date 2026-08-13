import type { readPublishingDestinationForDispatch } from "../persistence/readPublishingDestinationForDispatch.js";
import type { readPublishingIntegrationSecret } from "../persistence/readPublishingIntegrationSecret.js";
import type { readTenantPublishingIntegration } from "../persistence/readTenantPublishingIntegration.js";
import type { recordPublishingReceipt } from "../persistence/recordPublishingReceipt.js";
import type { refreshPublishingProviderConnection } from "../persistence/refreshPublishingProviderConnection.js";
import type { writePublishingAttemptCheckpoint } from "../persistence/writePublishingAttemptCheckpoint.js";

export type PrismaPublishingWorkflowPersistence = Readonly<{
  loadDestination: (
    input: Parameters<typeof readPublishingDestinationForDispatch>[1],
  ) => ReturnType<typeof readPublishingDestinationForDispatch>;
  readIntegration: (
    input: Parameters<typeof readTenantPublishingIntegration>[1],
  ) => ReturnType<typeof readTenantPublishingIntegration>;
  readSecret: (
    input: Parameters<typeof readPublishingIntegrationSecret>[1],
  ) => ReturnType<typeof readPublishingIntegrationSecret>;
  refreshConnection: (
    input: Parameters<typeof refreshPublishingProviderConnection>[1],
  ) => ReturnType<typeof refreshPublishingProviderConnection>;
  writeCheckpoint: (
    input: Parameters<typeof writePublishingAttemptCheckpoint>[1],
  ) => ReturnType<typeof writePublishingAttemptCheckpoint>;
  recordReceipt: (
    input: Parameters<typeof recordPublishingReceipt>[1],
  ) => ReturnType<typeof recordPublishingReceipt>;
}>;
