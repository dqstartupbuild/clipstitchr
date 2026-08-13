import type { PublishingOutboxDisposition } from "../outbox/PublishingOutboxDisposition.js";
import type { InstagramFacebookProviderAdapter } from "../provider-runtime/instagram/InstagramFacebookProviderAdapter.js";
import type { InstagramPublishCheckpoint } from "../provider-runtime/instagram/InstagramPublishCheckpoint.js";
import type { InstagramStandaloneProviderAdapter } from "../provider-runtime/instagram/InstagramStandaloneProviderAdapter.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { StoredPublishingWorkflowCheckpoint } from "./StoredPublishingWorkflowCheckpoint.js";
import { createInstagramMedia } from "./createInstagramMedia.js";
import { createPublishingWorkflowOperationId } from "./createPublishingWorkflowOperationId.js";
import { createPublishingWorkflowRetryDate } from "./createPublishingWorkflowRetryDate.js";
import { createSafeProviderResult } from "./createSafeProviderResult.js";
import { decodeInstagramPublishCheckpoint } from "./decodeInstagramPublishCheckpoint.js";
import { encodeInstagramPublishCheckpoint } from "./encodeInstagramPublishCheckpoint.js";
import { getInstagramProviderOperationKind } from "./getInstagramProviderOperationKind.js";
import { isInstagramDispatchPhase } from "./isInstagramDispatchPhase.js";
import { mapProviderRuntimeErrorResult } from "./mapProviderRuntimeErrorResult.js";
import { readProviderRetryAfterSeconds } from "./readProviderRetryAfterSeconds.js";
import { recordStoredTerminalObservation } from "./recordStoredTerminalObservation.js";
import { writePublishingTerminalObservation } from "./writePublishingTerminalObservation.js";
import { writePublishingWorkflowCheckpoint } from "./writePublishingWorkflowCheckpoint.js";
import { handlePublishingPreflightError } from "./handlePublishingPreflightError.js";

type InstagramRuntime =
  | InstagramFacebookProviderAdapter
  | InstagramStandaloneProviderAdapter;

export const advanceInstagramPublishingWorkflow = async (
  context: PublishingProviderWorkflowContext,
  runtime: InstagramRuntime,
  stored: StoredPublishingWorkflowCheckpoint | null,
): Promise<PublishingOutboxDisposition> => {
  if (stored?.stage === "terminal") {
    await recordStoredTerminalObservation(
      context,
      stored.result,
    );
    return { kind: "complete" };
  }

  if (stored?.stage === "instagram-dispatch-intent") {
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      getInstagramProviderOperationKind(
        stored.previousCheckpoint === null
          ? undefined
          : decodeInstagramPublishCheckpoint(stored.previousCheckpoint),
      ),
      createSafeProviderResult(
        context.item.provider,
        "outcome_unknown",
        stored.operationId,
      ),
    );
    return { kind: "complete" };
  }

  let providerCheckpoint: InstagramPublishCheckpoint | undefined;

  if (stored?.stage === "instagram-progress") {
    providerCheckpoint = decodeInstagramPublishCheckpoint(stored.checkpoint);
  } else if (stored?.stage === "instagram-ready" && stored.checkpoint !== null) {
    providerCheckpoint = decodeInstagramPublishCheckpoint(stored.checkpoint);
  } else if (stored !== null && stored?.stage !== "instagram-ready") {
    throw new ProviderRuntimeError(context.item.provider, "invalid_request");
  }

  if (
    providerCheckpoint?.phase === "create_child_dispatched" ||
    providerCheckpoint?.phase === "create_parent_dispatched" ||
    providerCheckpoint?.phase === "publish_dispatched"
  ) {
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      getInstagramProviderOperationKind(providerCheckpoint),
      createSafeProviderResult(
        context.item.provider,
        "outcome_unknown",
        providerCheckpoint.activeContainerId,
      ),
    );
    return { kind: "complete" };
  }

  if (providerCheckpoint?.phase === "published") {
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      "meta-media-publish",
      {
        provider: context.item.provider,
        kind: "published",
        providerOperationId: providerCheckpoint.mediaId,
        remotePostIds:
          providerCheckpoint.mediaId === undefined
            ? Object.freeze([])
            : Object.freeze([providerCheckpoint.mediaId]),
        remoteUrls:
          providerCheckpoint.permalink === undefined
            ? Object.freeze([])
            : Object.freeze([providerCheckpoint.permalink]),
        visibility: context.item.settings.provider === "instagram"
          ? context.item.settings.placement
          : undefined,
      },
    );
    return { kind: "complete" };
  }

  const operationKind = getInstagramProviderOperationKind(providerCheckpoint);
  let accessToken: string;
  let grants: readonly PublishingWorkflowMediaGrant[];

  try {
    [accessToken, grants] = await Promise.all([
      context.port.readAccessToken(context.item),
      context.port.resolveMediaGrants(context.item),
    ]);
  } catch (error) {
    return handlePublishingPreflightError(context, operationKind, error);
  }
  const dispatchPhase = isInstagramDispatchPhase(providerCheckpoint);
  let expectedVersion = context.item.checkpointVersion;
  let operationId =
    providerCheckpoint?.activeContainerId ??
    providerCheckpoint?.parentContainerId ??
    createPublishingWorkflowOperationId(
      context.item.attemptId,
      expectedVersion,
      providerCheckpoint?.phase ?? "initial",
    );

  if (dispatchPhase) {
    expectedVersion = await writePublishingWorkflowCheckpoint(
      context,
      expectedVersion,
      {
        schemaVersion: 1,
        stage: "instagram-dispatch-intent",
        operationId,
        previousCheckpoint:
          providerCheckpoint === undefined
            ? null
            : encodeInstagramPublishCheckpoint(providerCheckpoint),
      },
      operationKind,
      operationId,
    );
  }

  try {
    const progress = await runtime.advancePublish(
      {
        attemptKey: context.item.attemptKey,
        accountId: context.item.accountId,
        accessToken,
        caption: context.item.caption,
        placement:
          context.item.settings.provider === "instagram"
            ? context.item.settings.placement
            : "feed",
        media: createInstagramMedia(context.item, grants),
      },
      providerCheckpoint,
    );
    operationId = progress.result.providerOperationId ?? operationId;

    if (
      progress.result.kind === "published" ||
      progress.result.kind === "published_not_public" ||
      progress.result.kind === "requires_user_action" ||
      progress.result.kind === "rejected" ||
      progress.result.kind === "outcome_unknown"
    ) {
      await writePublishingTerminalObservation(
        context,
        expectedVersion,
        getInstagramProviderOperationKind(progress.checkpoint),
        progress.result,
      );
      return { kind: "complete" };
    }

    await writePublishingWorkflowCheckpoint(
      context,
      expectedVersion,
      {
        schemaVersion: 1,
        stage: "instagram-progress",
        checkpoint: encodeInstagramPublishCheckpoint(progress.checkpoint),
      },
      getInstagramProviderOperationKind(progress.checkpoint),
      operationId,
    );
    await context.port.recordObservation({
      item: context.item,
      observation: { result: progress.result, observedAt: context.now() },
    });
    return {
      kind: "retry",
      availableAt: createPublishingWorkflowRetryDate(context.now(), 5),
      safeErrorCode: "provider_processing",
    };
  } catch (error) {
    if (error instanceof ProviderRuntimeError && error.code === "rate_limited") {
      if (dispatchPhase) {
        await writePublishingWorkflowCheckpoint(
          context,
          expectedVersion,
          {
            schemaVersion: 1,
            stage: "instagram-ready",
            checkpoint:
              providerCheckpoint === undefined
                ? null
                : encodeInstagramPublishCheckpoint(providerCheckpoint),
          },
          operationKind,
          operationId,
        );
      }
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          context.now(),
          readProviderRetryAfterSeconds(error),
        ),
        safeErrorCode: "provider_rate_limited",
      };
    }

    const result = mapProviderRuntimeErrorResult(context.item.provider, error);
    await writePublishingTerminalObservation(
      context,
      expectedVersion,
      operationKind,
      result ?? createSafeProviderResult(context.item.provider, "outcome_unknown"),
    );
    return { kind: "complete" };
  }
};
