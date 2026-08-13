import type { PrismaClient } from "@prisma/client";

import { readPublishingDestinationForDispatch } from "../persistence/readPublishingDestinationForDispatch.js";
import { readPublishingIntegrationSecret } from "../persistence/readPublishingIntegrationSecret.js";
import { readTenantPublishingIntegration } from "../persistence/readTenantPublishingIntegration.js";
import { recordPublishingReceipt } from "../persistence/recordPublishingReceipt.js";
import { refreshPublishingProviderConnection } from "../persistence/refreshPublishingProviderConnection.js";
import { writePublishingAttemptCheckpoint } from "../persistence/writePublishingAttemptCheckpoint.js";
import type { PrismaPublishingWorkflowPersistence } from "./PrismaPublishingWorkflowPersistence.js";

export const createPrismaPublishingWorkflowPersistence = (
  database: PrismaClient,
): PrismaPublishingWorkflowPersistence =>
  Object.freeze({
    loadDestination: (input) =>
      readPublishingDestinationForDispatch(database, input),
    readIntegration: (input) =>
      readTenantPublishingIntegration(database, input),
    readSecret: (input) => readPublishingIntegrationSecret(database, input),
    refreshConnection: (input) =>
      refreshPublishingProviderConnection(database, input),
    writeCheckpoint: (input) =>
      writePublishingAttemptCheckpoint(database, input),
    recordReceipt: (input) => recordPublishingReceipt(database, input),
  });
