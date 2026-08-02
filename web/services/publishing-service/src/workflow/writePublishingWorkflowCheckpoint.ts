import type { PublishingProviderOperationKind } from "../persistence/PublishingProviderOperationKind.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";

export const writePublishingWorkflowCheckpoint = async (
  context: PublishingProviderWorkflowContext,
  expectedVersion: number,
  checkpoint: Readonly<Record<string, unknown>>,
  providerOperationKind: PublishingProviderOperationKind,
  providerOperationId: string,
): Promise<number> =>
  context.port.writeCheckpoint({
    item: context.item,
    expectedVersion,
    checkpoint,
    providerOperationKind,
    providerOperationId,
    checkpointedAt: context.now(),
  });
