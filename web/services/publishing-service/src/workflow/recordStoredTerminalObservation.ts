import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import type { StoredProviderPublishResult } from "./StoredProviderPublishResult.js";
import { decodeProviderPublishResult } from "./decodeProviderPublishResult.js";

export const recordStoredTerminalObservation = async (
  context: PublishingProviderWorkflowContext,
  storedResult: StoredProviderPublishResult,
): Promise<void> => {
  const result = decodeProviderPublishResult(storedResult);
  await context.port.recordObservation({
    item: context.item,
    observation: { result, observedAt: context.now() },
  });
};
