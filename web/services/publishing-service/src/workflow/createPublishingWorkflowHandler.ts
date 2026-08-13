import type { PublishingOutboxHandler } from "../outbox/PublishingOutboxHandler.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { InstagramFacebookProviderAdapter } from "../provider-runtime/instagram/InstagramFacebookProviderAdapter.js";
import type { InstagramStandaloneProviderAdapter } from "../provider-runtime/instagram/InstagramStandaloneProviderAdapter.js";
import type { TikTokProviderAdapter } from "../provider-runtime/tiktok/TikTokProviderAdapter.js";
import type { YouTubeProviderAdapter } from "../provider-runtime/youtube/YouTubeProviderAdapter.js";
import { advanceInstagramPublishingWorkflow } from "./advanceInstagramPublishingWorkflow.js";
import { advanceTikTokPublishingWorkflow } from "./advanceTikTokPublishingWorkflow.js";
import { advanceYouTubePublishingWorkflow } from "./advanceYouTubePublishingWorkflow.js";
import type { PublishingWorkflowHandlerOptions } from "./PublishingWorkflowHandlerOptions.js";
import { createPublishingWorkflowRetryDate } from "./createPublishingWorkflowRetryDate.js";
import { readPublishingWorkflowNow } from "./readPublishingWorkflowNow.js";
import { readStoredPublishingWorkflowCheckpoint } from "./readStoredPublishingWorkflowCheckpoint.js";

export const createPublishingWorkflowHandler = (
  options: PublishingWorkflowHandlerOptions,
): PublishingOutboxHandler => {
  const now = options.now ?? (() => new Date());

  return async (record, signal) => {
    if (signal.aborted) {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          readPublishingWorkflowNow(now),
          1,
        ),
        safeErrorCode: "worker_stopping",
      };
    }

    if (
      record.eventType !== "publishing.destination.requested" ||
      !Number.isSafeInteger(record.eventVersion) ||
      record.eventVersion < 1
    ) {
      return { kind: "dead-letter", safeErrorCode: "unsupported_event" };
    }

    const item = await options.port.load(record);

    if (item.alreadyPublished || item.terminal || !item.providerCallAllowed) {
      return { kind: "complete" };
    }

    let dispatchAllowed: boolean;

    try {
      dispatchAllowed = await options.authorizeDispatch(
        { ownerId: item.ownerId, productId: item.productId },
        signal,
      );
    } catch {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          readPublishingWorkflowNow(now),
          60,
        ),
        safeErrorCode: "studio_access_unavailable",
      };
    }

    if (!dispatchAllowed) {
      return {
        kind: "retry",
        availableAt: createPublishingWorkflowRetryDate(
          readPublishingWorkflowNow(now),
          3_600,
        ),
        safeErrorCode: "studio_access_denied",
      };
    }

    const runtime = options.providerRuntimes.get(item.provider);

    if (runtime === undefined) {
      return { kind: "dead-letter", safeErrorCode: "provider_disabled" };
    }

    const context = Object.freeze({ item, port: options.port, now });
    const stored = readStoredPublishingWorkflowCheckpoint(item.checkpoint);

    if (runtime.id === "tiktok") {
      if (item.settings.provider !== "tiktok") {
        throw new ProviderRuntimeError("tiktok", "invalid_request");
      }
      return advanceTikTokPublishingWorkflow(
        context,
        runtime as TikTokProviderAdapter,
        stored,
      );
    }

    if (runtime.id === "youtube") {
      if (item.settings.provider !== "youtube") {
        throw new ProviderRuntimeError("youtube", "invalid_request");
      }
      return advanceYouTubePublishingWorkflow(
        context,
        runtime as YouTubeProviderAdapter,
        stored,
      );
    }

    if (item.settings.provider !== "instagram") {
      throw new ProviderRuntimeError(runtime.id, "invalid_request");
    }

    return advanceInstagramPublishingWorkflow(
      context,
      runtime as
        | InstagramFacebookProviderAdapter
        | InstagramStandaloneProviderAdapter,
      stored,
    );
  };
};
