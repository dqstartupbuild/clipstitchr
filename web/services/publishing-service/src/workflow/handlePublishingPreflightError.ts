import type { PublishingOutboxDisposition } from "../outbox/PublishingOutboxDisposition.js";
import type { PublishingProviderOperationKind } from "../persistence/PublishingProviderOperationKind.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import { createPublishingWorkflowRetryDate } from "./createPublishingWorkflowRetryDate.js";
import { createSafeProviderResult } from "./createSafeProviderResult.js";
import { mapProviderRuntimeErrorResult } from "./mapProviderRuntimeErrorResult.js";
import { readProviderRetryAfterSeconds } from "./readProviderRetryAfterSeconds.js";
import { writePublishingTerminalObservation } from "./writePublishingTerminalObservation.js";

export const handlePublishingPreflightError = async (
  context: PublishingProviderWorkflowContext,
  operationKind: PublishingProviderOperationKind,
  error: unknown,
): Promise<PublishingOutboxDisposition> => {
  if (!(error instanceof ProviderRuntimeError)) {
    throw error;
  }

  if (error.code === "rate_limited" || error.retryable) {
    return {
      kind: "retry",
      availableAt: createPublishingWorkflowRetryDate(
        context.now(),
        error.code === "rate_limited"
          ? readProviderRetryAfterSeconds(error)
          : 60,
      ),
      safeErrorCode:
        error.code === "rate_limited"
          ? "provider_rate_limited"
          : "provider_preflight_unavailable",
    };
  }

  const result =
    error.code === "invalid_response"
      ? createSafeProviderResult(context.item.provider, "requires_user_action")
      : mapProviderRuntimeErrorResult(context.item.provider, error) ??
        createSafeProviderResult(context.item.provider, "requires_user_action");
  await writePublishingTerminalObservation(
    context,
    context.item.checkpointVersion,
    operationKind,
    result,
  );
  return { kind: "complete" };
};
