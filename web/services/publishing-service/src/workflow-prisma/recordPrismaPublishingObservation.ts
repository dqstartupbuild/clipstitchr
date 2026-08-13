import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingWorkflowPort } from "../workflow/PublishingWorkflowPort.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";
import { createPublishingWorkflowObservationDigest } from "./createPublishingWorkflowObservationDigest.js";
import { createPublishingWorkflowReceiptMetadata } from "./createPublishingWorkflowReceiptMetadata.js";
import { createPublishingWorkflowRemotePublications } from "./createPublishingWorkflowRemotePublications.js";
import { mapPublishingWorkflowReceiptResult } from "./mapPublishingWorkflowReceiptResult.js";

export const recordPrismaPublishingObservation = async (
  context: PrismaPublishingWorkflowContext,
  input: Parameters<PublishingWorkflowPort["recordObservation"]>[0],
): Promise<void> => {
  const { result, observedAt } = input.observation;

  if (
    result.provider !== input.item.provider ||
    !Number.isSafeInteger(observedAt.getTime())
  ) {
    throw new ProviderRuntimeError(input.item.provider, "invalid_response");
  }

  const receiptResult = mapPublishingWorkflowReceiptResult(result.kind);
  const publications = createPublishingWorkflowRemotePublications(result);
  const safeMetadata = createPublishingWorkflowReceiptMetadata(
    result,
    publications,
  );
  const responseDigest = createPublishingWorkflowObservationDigest(
    receiptResult,
    safeMetadata,
    publications,
  );

  await context.persistence.recordReceipt({
    tenantKey: input.item.tenantKey,
    postStateId: input.item.postStateId,
    attemptId: input.item.attemptId,
    provider: input.item.provider,
    result: receiptResult,
    responseDigest,
    safeMetadata,
    remotePublications: publications,
    observedAt,
  });
};
