import type { PublishingOutboxDisposition } from "../outbox/PublishingOutboxDisposition.js";
import type { YouTubeProviderAdapter } from "../provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { PublishingProviderWorkflowContext } from "./PublishingProviderWorkflowContext.js";
import type { StoredYouTubeUploadCheckpoint } from "./StoredYouTubeUploadCheckpoint.js";
import { createYouTubePublishedResult } from "./createYouTubePublishedResult.js";
import { writePublishingTerminalObservation } from "./writePublishingTerminalObservation.js";
import { writePublishingWorkflowCheckpoint } from "./writePublishingWorkflowCheckpoint.js";

export const finalizeYouTubePublishingWorkflow = async (
  context: PublishingProviderWorkflowContext,
  runtime: YouTubeProviderAdapter,
  checkpoint: StoredYouTubeUploadCheckpoint,
  expectedVersion: number,
  accessToken: string,
  thumbnailGrantUrl?: string,
): Promise<PublishingOutboxDisposition> => {
  const videoId = checkpoint.videoId!;
  let version = expectedVersion;
  let thumbnailState = checkpoint.thumbnailState;
  const thumbnail = context.item.settings.provider === "youtube"
    ? context.item.settings.thumbnail
    : undefined;

  if (thumbnail !== undefined && thumbnailState === "pending") {
    try {
      if (thumbnailGrantUrl === undefined) {
        throw new Error("Missing thumbnail grant");
      }
      await runtime.uploadThumbnail({
        accessToken,
        byteLength: thumbnail.byteLength,
        contentType: thumbnail.contentType as "image/jpeg" | "image/png",
        mediaUrl: thumbnailGrantUrl,
        videoId,
      });
      thumbnailState = "complete";
    } catch {
      thumbnailState = "outcome-unknown";
    }
    version = await writePublishingWorkflowCheckpoint(
      context,
      version,
      { ...checkpoint, thumbnailState },
      "youtube-resumable-upload",
      videoId,
    );
  }

  await writePublishingTerminalObservation(
    context,
    version,
    "youtube-resumable-upload",
    createYouTubePublishedResult(
      videoId,
      context.item.settings.provider === "youtube"
        ? context.item.settings.visibility
        : "private",
    ),
  );
  return { kind: "complete" };
};
