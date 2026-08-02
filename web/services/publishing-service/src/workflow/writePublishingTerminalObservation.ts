import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { PublishingProviderOperationKind } from "../persistence/PublishingProviderOperationKind.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import { createPublishingWorkflowOperationId } from "./createPublishingWorkflowOperationId.js";
import { encodeProviderPublishResult } from "./encodeProviderPublishResult.js";
import { writePublishingWorkflowCheckpoint } from "./writePublishingWorkflowCheckpoint.js";

export const writePublishingTerminalObservation = async (
  context: PublishingProviderWorkflowContext,
  expectedVersion: number,
  operationKind: PublishingProviderOperationKind,
  result: ProviderPublishResult,
): Promise<void> => {
  const operationId =
    result.providerOperationId ??
    createPublishingWorkflowOperationId(
      context.item.attemptId,
      expectedVersion,
      "terminal",
    );

  await writePublishingWorkflowCheckpoint(
    context,
    expectedVersion,
    {
      schemaVersion: 1,
      stage: "terminal",
      result: encodeProviderPublishResult(result),
    },
    operationKind,
    operationId,
  );
  await context.port.recordObservation({
    item: context.item,
    observation: { result, observedAt: context.now() },
  });
};
