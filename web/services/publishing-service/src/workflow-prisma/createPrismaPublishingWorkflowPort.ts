import type { PublishingWorkflowPort } from "../workflow/PublishingWorkflowPort.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";
import type { PrismaPublishingWorkflowPortOptions } from "./PrismaPublishingWorkflowPortOptions.js";
import { createPrismaPublishingWorkflowPersistence } from "./createPrismaPublishingWorkflowPersistence.js";
import { loadPrismaPublishingWorkflowItem } from "./loadPrismaPublishingWorkflowItem.js";
import { readPrismaPublishingAccessToken } from "./readPrismaPublishingAccessToken.js";
import { recordPrismaPublishingObservation } from "./recordPrismaPublishingObservation.js";
import { writePrismaPublishingCheckpoint } from "./writePrismaPublishingCheckpoint.js";

export const createPrismaPublishingWorkflowPort = (
  options: PrismaPublishingWorkflowPortOptions,
): PublishingWorkflowPort => {
  const context: PrismaPublishingWorkflowContext = Object.freeze({
    keyring: options.keyring,
    cipherKey: options.cipherKey,
    providerRuntimes: options.providerRuntimes,
    resolveMediaGrants: options.resolveMediaGrants,
    now: options.now ?? (() => new Date()),
    persistence:
      options.persistence ??
      createPrismaPublishingWorkflowPersistence(options.database),
  });

  return Object.freeze({
    load: (record) => loadPrismaPublishingWorkflowItem(context, record),
    readAccessToken: (item) => readPrismaPublishingAccessToken(context, item),
    resolveMediaGrants: (item) => context.resolveMediaGrants(item),
    writeCheckpoint: (input) => writePrismaPublishingCheckpoint(context, input),
    recordObservation: (input) =>
      recordPrismaPublishingObservation(context, input),
  });
};
