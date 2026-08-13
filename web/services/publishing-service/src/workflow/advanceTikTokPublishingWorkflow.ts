import type { PublishingOutboxDisposition } from "../outbox/PublishingOutboxDisposition.js";
import type { TikTokProviderAdapter } from "../provider-runtime/tiktok/TikTokProviderAdapter.js";
import type { TikTokCreatorInfo } from "../provider-runtime/tiktok/TikTokCreatorInfo.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { StoredPublishingWorkflowCheckpoint } from "./StoredPublishingWorkflowCheckpoint.js";
import { createPublishingWorkflowOperationId } from "./createPublishingWorkflowOperationId.js";
import { createPublishingWorkflowRetryDate } from "./createPublishingWorkflowRetryDate.js";
import { createSafeProviderResult } from "./createSafeProviderResult.js";
import { createTikTokPublishRequest } from "./createTikTokPublishRequest.js";
import { getTikTokPollDelaySeconds } from "./getTikTokPollDelaySeconds.js";
import { mapProviderRuntimeErrorResult } from "./mapProviderRuntimeErrorResult.js";
import { normalizeTikTokTerminalResult } from "./normalizeTikTokTerminalResult.js";
import { readProviderRetryAfterSeconds } from "./readProviderRetryAfterSeconds.js";
import { recordStoredTerminalObservation } from "./recordStoredTerminalObservation.js";
import { writePublishingTerminalObservation } from "./writePublishingTerminalObservation.js";
import { writePublishingWorkflowCheckpoint } from "./writePublishingWorkflowCheckpoint.js";
import { handlePublishingPreflightError } from "./handlePublishingPreflightError.js";

const MAXIMUM_TIKTOK_PROCESSING_MILLISECONDS = 86_400_000;

export const advanceTikTokPublishingWorkflow = async (
  context: PublishingProviderWorkflowContext,
  runtime: TikTokProviderAdapter,
  stored: StoredPublishingWorkflowCheckpoint | null,
): Promise<PublishingOutboxDisposition> => {
  if (stored?.stage === "terminal") {
    await recordStoredTerminalObservation(context, stored.result);
    return { kind: "complete" };
  }

  if (stored?.stage === "tiktok-dispatch-intent") {
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      "tiktok-publish",
      createSafeProviderResult("tiktok", "outcome_unknown", stored.operationId),
    );
    return { kind: "complete" };
  }

  if (
    stored !== null &&
    stored.stage !== "tiktok-ready" &&
    stored.stage !== "tiktok-processing"
  ) {
    throw new ProviderRuntimeError("tiktok", "invalid_request");
  }

  let accessToken: string;

  try {
    accessToken = await context.port.readAccessToken(context.item);
  } catch (error) {
    return handlePublishingPreflightError(context, "tiktok-publish", error);
  }

  if (stored?.stage === "tiktok-processing") {
    if (
      context.now().getTime() - stored.acceptedAtEpochMilliseconds >
      MAXIMUM_TIKTOK_PROCESSING_MILLISECONDS
    ) {
      await writePublishingTerminalObservation(
        context,
        context.item.checkpointVersion,
        "tiktok-publish",
        createSafeProviderResult("tiktok", "outcome_unknown", stored.publishId),
      );
      return { kind: "complete" };
    }

    try {
      const result = normalizeTikTokTerminalResult(
        await runtime.getPostStatus(accessToken, stored.publishId),
      );

      if (
        result.kind === "media_transfer_pending" ||
        result.kind === "processing" ||
        result.kind === "accepted"
      ) {
        const nextPollCount = stored.pollCount + 1;
        await writePublishingWorkflowCheckpoint(
          context,
          context.item.checkpointVersion,
          {
            schemaVersion: 1,
            stage: "tiktok-processing",
            publishId: stored.publishId,
            pollCount: nextPollCount,
            acceptedAtEpochMilliseconds: stored.acceptedAtEpochMilliseconds,
          },
          "tiktok-publish",
          stored.publishId,
        );
        await context.port.recordObservation({
          item: context.item,
          observation: { result, observedAt: context.now() },
        });
        return {
          kind: "retry",
          availableAt: createPublishingWorkflowRetryDate(
            context.now(),
            getTikTokPollDelaySeconds(nextPollCount),
          ),
          safeErrorCode: "provider_processing",
        };
      }

      await writePublishingTerminalObservation(
        context,
        context.item.checkpointVersion,
        "tiktok-publish",
        result,
      );
      return { kind: "complete" };
    } catch (error) {
      if (error instanceof ProviderRuntimeError && error.code === "rate_limited") {
        return {
          kind: "retry",
          availableAt: createPublishingWorkflowRetryDate(
            context.now(),
            readProviderRetryAfterSeconds(error),
          ),
          safeErrorCode: "provider_rate_limited",
        };
      }
      if (error instanceof ProviderRuntimeError && error.retryable) {
        return {
          kind: "retry",
          availableAt: createPublishingWorkflowRetryDate(context.now(), 60),
          safeErrorCode: "provider_status_unavailable",
        };
      }
      await writePublishingTerminalObservation(
        context,
        context.item.checkpointVersion,
        "tiktok-publish",
        mapProviderRuntimeErrorResult("tiktok", error) ??
          createSafeProviderResult("tiktok", "outcome_unknown"),
      );
      return { kind: "complete" };
    }
  }

  let grants: readonly PublishingWorkflowMediaGrant[];
  let creatorInfo: TikTokCreatorInfo | undefined;

  try {
    grants = await context.port.resolveMediaGrants(context.item);
    creatorInfo =
      context.item.settings.provider === "tiktok" &&
      context.item.settings.mode === "direct"
        ? await runtime.getCreatorInfo(accessToken)
        : undefined;
  } catch (error) {
    return handlePublishingPreflightError(context, "tiktok-publish", error);
  }
  const operationId = createPublishingWorkflowOperationId(
    context.item.attemptId,
    context.item.checkpointVersion,
    "tiktok-init",
  );
  const intentVersion = await writePublishingWorkflowCheckpoint(
    context,
    context.item.checkpointVersion,
    {
      schemaVersion: 1,
      stage: "tiktok-dispatch-intent",
      operationId,
    },
    "tiktok-publish",
    operationId,
  );

  try {
    const result = normalizeTikTokTerminalResult(
      await runtime.publish(
        createTikTokPublishRequest(
          context.item,
          accessToken,
          grants,
          creatorInfo,
        ),
      ),
    );

    if (result.kind === "accepted" && result.providerOperationId !== undefined) {
      const acceptedAt = context.now();
      await writePublishingWorkflowCheckpoint(
        context,
        intentVersion,
        {
          schemaVersion: 1,
          stage: "tiktok-processing",
          publishId: result.providerOperationId,
          pollCount: 0,
          acceptedAtEpochMilliseconds: acceptedAt.getTime(),
        },
        "tiktok-publish",
        result.providerOperationId,
      );
      await context.port.recordObservation({
        item: context.item,
        observation: { result, observedAt: acceptedAt },
      });
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(acceptedAt, 5),
        safeErrorCode: "provider_processing",
      };
    }

    await writePublishingTerminalObservation(
      context,
      intentVersion,
      "tiktok-publish",
      result,
    );
    return { kind: "complete" };
  } catch (error) {
    if (error instanceof ProviderRuntimeError && error.code === "rate_limited") {
      await writePublishingWorkflowCheckpoint(
        context,
        intentVersion,
        { schemaVersion: 1, stage: "tiktok-ready" },
        "tiktok-publish",
        operationId,
      );
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          context.now(),
          readProviderRetryAfterSeconds(error),
        ),
        safeErrorCode: "provider_rate_limited",
      };
    }
    await writePublishingTerminalObservation(
      context,
      intentVersion,
      "tiktok-publish",
      mapProviderRuntimeErrorResult("tiktok", error) ??
        createSafeProviderResult("tiktok", "outcome_unknown"),
    );
    return { kind: "complete" };
  }
};
