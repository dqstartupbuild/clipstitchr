import type { PublishingRemotePublication } from "../persistence/PublishingRemotePublication.js";
import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingWorkflowReceiptMetadata } from "./PublishingWorkflowReceiptMetadata.js";
import { createSafePublishingProviderOperationReference } from "./createSafePublishingProviderOperationReference.js";

export const createPublishingWorkflowReceiptMetadata = (
  result: ProviderPublishResult,
  publications: readonly PublishingRemotePublication[],
): PublishingWorkflowReceiptMetadata => {
  if (result.remotePostIds.length > 20 || result.remoteUrls.length > 20) {
    throw new ProviderRuntimeError(result.provider, "invalid_response");
  }

  if (
    result.visibility !== undefined &&
    (result.visibility.length < 1 || result.visibility.length > 512)
  ) {
    throw new ProviderRuntimeError(result.provider, "invalid_response");
  }

  return Object.freeze({
    schemaVersion: 1,
    provider: result.provider,
    providerResultKind: result.kind,
    providerOperationId: createSafePublishingProviderOperationReference(
      result.provider,
      result.providerOperationId,
    ),
    visibility: result.visibility ?? null,
    remotePostCount: new Set(result.remotePostIds).size,
    observableUrlCount: publications.filter(
      (publication) => publication.observableUrl !== undefined,
    ).length,
  });
};
