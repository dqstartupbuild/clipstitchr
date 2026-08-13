import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import type { PublishingProviderOperationKind } from "../persistence/PublishingProviderOperationKind.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { PublishingWorkflowObservation } from "./PublishingWorkflowObservation.js";
import type { PublishingWorkflowWorkItem } from "./PublishingWorkflowWorkItem.js";

export type PublishingWorkflowPort = Readonly<{
  load: (
    record: LeasedPublishingOutboxRecord,
  ) => Promise<PublishingWorkflowWorkItem>;
  readAccessToken: (item: PublishingWorkflowWorkItem) => Promise<string>;
  resolveMediaGrants: (
    item: PublishingWorkflowWorkItem,
  ) => Promise<readonly PublishingWorkflowMediaGrant[]>;
  writeCheckpoint: (input: {
    item: PublishingWorkflowWorkItem;
    expectedVersion: number;
    checkpoint: Readonly<Record<string, unknown>>;
    providerOperationKind: PublishingProviderOperationKind;
    providerOperationId: string;
    checkpointedAt: Date;
  }) => Promise<number>;
  recordObservation: (input: {
    item: PublishingWorkflowWorkItem;
    observation: PublishingWorkflowObservation;
  }) => Promise<void>;
}>;
