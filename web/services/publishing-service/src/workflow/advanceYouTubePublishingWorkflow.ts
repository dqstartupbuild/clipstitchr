import type { PublishingOutboxDisposition } from "../outbox/PublishingOutboxDisposition.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { YouTubeProviderAdapter } from "../provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { StoredYouTubeUploadCheckpoint } from "./StoredYouTubeUploadCheckpoint.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import type { StoredPublishingWorkflowCheckpoint } from "./StoredPublishingWorkflowCheckpoint.js";
import { createPublishingWorkflowOperationId } from "./createPublishingWorkflowOperationId.js";
import { createPublishingWorkflowRetryDate } from "./createPublishingWorkflowRetryDate.js";
import { createSafeProviderResult } from "./createSafeProviderResult.js";
import { finalizeYouTubePublishingWorkflow } from "./finalizeYouTubePublishingWorkflow.js";
import { mapProviderRuntimeErrorResult } from "./mapProviderRuntimeErrorResult.js";
import { readProviderRetryAfterSeconds } from "./readProviderRetryAfterSeconds.js";
import { recordStoredTerminalObservation } from "./recordStoredTerminalObservation.js";
import { writePublishingTerminalObservation } from "./writePublishingTerminalObservation.js";
import { writePublishingWorkflowCheckpoint } from "./writePublishingWorkflowCheckpoint.js";

const YOUTUBE_CHUNK_BYTES = 8 * 1_024 * 1_024;

export const advanceYouTubePublishingWorkflow = async (
  context: PublishingProviderWorkflowContext,
  runtime: YouTubeProviderAdapter,
  stored: StoredPublishingWorkflowCheckpoint | null,
): Promise<PublishingOutboxDisposition> => {
  if (stored?.stage === "terminal") {
    await recordStoredTerminalObservation(context, stored.result);
    return { kind: "complete" };
  }
  if (context.item.settings.provider !== "youtube") {
    throw new ProviderRuntimeError("youtube", "invalid_request");
  }
  const thumbnail = context.item.settings.thumbnail;
  const expectedObjectCount = thumbnail === undefined ? 1 : 2;
  const video = context.item.media[0];
  if (
    context.item.media.length !== expectedObjectCount ||
    video === undefined ||
    video.contentType !== "video/mp4" ||
    context.item.caption.length > 5_000
  ) {
    throw new ProviderRuntimeError("youtube", "invalid_request");
  }
  if (stored?.stage === "youtube-session-intent") {
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      "youtube-resumable-upload",
      createSafeProviderResult("youtube", "outcome_unknown", stored.operationId),
    );
    return { kind: "complete" };
  }
  if (
    stored !== null &&
    stored.stage !== "youtube-ready" &&
    stored.stage !== "youtube-upload"
  ) {
    throw new ProviderRuntimeError("youtube", "invalid_request");
  }

  let accessToken: string;
  let grants;
  try {
    [accessToken, grants] = await Promise.all([
      context.port.readAccessToken(context.item),
      context.port.resolveMediaGrants(context.item),
    ]);
  } catch (error) {
    const result = mapProviderRuntimeErrorResult("youtube", error);
    if (result === null) {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(context.now(), 60),
        safeErrorCode: "provider_preflight_unavailable",
      };
    }
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      "youtube-resumable-upload",
      result,
    );
    return { kind: "complete" };
  }
  if (grants.length !== expectedObjectCount || grants[0] === undefined) {
    throw new ProviderRuntimeError("youtube", "invalid_request");
  }

  if (stored === null || stored.stage === "youtube-ready") {
    const operationId = createPublishingWorkflowOperationId(
      context.item.attemptId,
      context.item.checkpointVersion,
      "youtube-session",
    );
    const intentVersion = await writePublishingWorkflowCheckpoint(
      context,
      context.item.checkpointVersion,
      {
        schemaVersion: 1,
        stage: "youtube-session-intent",
        operationId,
        totalBytes: video.byteLength,
      },
      "youtube-resumable-upload",
      operationId,
    );
    try {
      const sessionUri = await runtime.initiateUpload({
        accessToken,
        contentType: "video/mp4",
        metadata: {
          title: context.item.settings.title,
          description:
            context.item.settings.description ?? context.item.caption,
          visibility: context.item.settings.visibility,
          madeForKids: context.item.settings.madeForKids,
          tags: context.item.settings.tags,
        },
        totalBytes: video.byteLength,
      });
      await writePublishingWorkflowCheckpoint(
        context,
        intentVersion,
        {
          schemaVersion: 1,
          stage: "youtube-upload",
          sessionUri,
          totalBytes: video.byteLength,
          committedOffset: 0,
          videoId: null,
          thumbnailState:
            thumbnail === undefined ? "not-requested" : "pending",
        },
        "youtube-resumable-upload",
        operationId,
      );
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(context.now(), 1),
        safeErrorCode: "provider_processing",
      };
    } catch (error) {
      if (error instanceof ProviderRuntimeError && error.code === "rate_limited") {
        await writePublishingWorkflowCheckpoint(
          context,
          intentVersion,
          {
            schemaVersion: 1,
            stage: "youtube-ready",
            totalBytes: video.byteLength,
          },
          "youtube-resumable-upload",
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
        "youtube-resumable-upload",
        error instanceof ProviderRuntimeError &&
          error.code !== "network" &&
          error.code !== "transient_failure"
          ? mapProviderRuntimeErrorResult("youtube", error) ??
              createSafeProviderResult("youtube", "rejected", operationId)
          : createSafeProviderResult("youtube", "outcome_unknown", operationId),
      );
      return { kind: "complete" };
    }
  }

  let checkpoint = stored as StoredYouTubeUploadCheckpoint;
  if (
    checkpoint.totalBytes !== video.byteLength ||
    checkpoint.committedOffset > video.byteLength
  ) {
    throw new ProviderRuntimeError("youtube", "invalid_request");
  }
  if (checkpoint.videoId !== null) {
    return finalizeYouTubePublishingWorkflow(
      context,
      runtime,
      checkpoint,
      context.item.checkpointVersion,
      accessToken,
      grants[1]?.url,
    );
  }

  try {
    const probed = await runtime.probeUpload({
      accessToken,
      sessionUri: checkpoint.sessionUri,
      totalBytes: checkpoint.totalBytes,
    });
    if (probed.kind === "expired") {
      await writePublishingTerminalObservation(
        context,
        context.item.checkpointVersion,
        "youtube-resumable-upload",
        createSafeProviderResult("youtube", "rejected"),
      );
      return { kind: "complete" };
    }
    if (probed.kind === "complete") {
      checkpoint = Object.freeze({
        ...checkpoint,
        committedOffset: checkpoint.totalBytes,
        videoId: probed.videoId,
      });
      const version = await writePublishingWorkflowCheckpoint(
        context,
        context.item.checkpointVersion,
        checkpoint,
        "youtube-resumable-upload",
        probed.videoId,
      );
      return finalizeYouTubePublishingWorkflow(
        context,
        runtime,
        checkpoint,
        version,
        accessToken,
        grants[1]?.url,
      );
    }
    if (probed.committedOffset === checkpoint.totalBytes) {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(context.now(), 5),
        safeErrorCode: "provider_processing",
      };
    }
    const endOffsetInclusive = Math.min(
      probed.committedOffset + YOUTUBE_CHUNK_BYTES - 1,
      checkpoint.totalBytes - 1,
    );
    const progress = await runtime.uploadRange({
      accessToken,
      contentType: "video/mp4",
      endOffsetInclusive,
      mediaUrl: grants[0].url,
      sessionUri: checkpoint.sessionUri,
      startOffset: probed.committedOffset,
      totalBytes: checkpoint.totalBytes,
    });
    if (progress.kind === "expired") {
      await writePublishingTerminalObservation(
        context,
        context.item.checkpointVersion,
        "youtube-resumable-upload",
        createSafeProviderResult("youtube", "rejected"),
      );
      return { kind: "complete" };
    }
    checkpoint = Object.freeze({
      ...checkpoint,
      committedOffset:
        progress.kind === "complete"
          ? checkpoint.totalBytes
          : progress.committedOffset,
      videoId: progress.kind === "complete" ? progress.videoId : null,
    });
    const version = await writePublishingWorkflowCheckpoint(
      context,
      context.item.checkpointVersion,
      checkpoint,
      "youtube-resumable-upload",
      progress.kind === "complete" ? progress.videoId : checkpoint.sessionUri,
    );
    if (progress.kind === "complete") {
      return finalizeYouTubePublishingWorkflow(
        context,
        runtime,
        checkpoint,
        version,
        accessToken,
        grants[1]?.url,
      );
    }
    return {
      kind: "retry",
      availableAt: createPublishingWorkflowRetryDate(context.now(), 1),
      safeErrorCode: "provider_processing",
    };
  } catch (error) {
    if (error instanceof ProviderRuntimeError && error.retryable) {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          context.now(),
          error.code === "rate_limited"
            ? readProviderRetryAfterSeconds(error)
            : 5,
        ),
        safeErrorCode:
          error.code === "rate_limited"
            ? "provider_rate_limited"
            : "provider_status_unavailable",
      };
    }
    await writePublishingTerminalObservation(
      context,
      context.item.checkpointVersion,
      "youtube-resumable-upload",
      mapProviderRuntimeErrorResult("youtube", error) ??
        createSafeProviderResult("youtube", "outcome_unknown"),
    );
    return { kind: "complete" };
  }
};
