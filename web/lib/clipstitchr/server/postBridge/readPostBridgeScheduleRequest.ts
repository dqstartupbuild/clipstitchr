import { createPostBridgeUploadedMedia } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadedMedia";
import { getPostBridgeSourceType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceType";
import { normalizePostBridgeCaption } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeCaption";
import { normalizePostBridgeScheduledAt } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeScheduledAt";
import { normalizePostBridgeTitle } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeTitle";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";

type PostBridgeScheduleRequestBody = {
  caption?: unknown;
  hasAudio?: unknown;
  mediaFiles?: unknown;
  scheduledAt?: unknown;
  socialAccountIds?: unknown;
  sourceId?: unknown;
  sourceType?: unknown;
  title?: unknown;
};

type PostBridgeUploadedMediaBody = {
  mediaId?: unknown;
  mimeType?: unknown;
  name?: unknown;
  sizeBytes?: unknown;
};

export type PostBridgeScheduleRequest = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: PostBridgeUploadedMedia[];
  scheduledAt: string | null;
  socialAccountIds: number[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
};

export async function readPostBridgeScheduleRequest(
  request: Request,
): Promise<PostBridgeScheduleRequest> {
  const body = (await request.json()) as PostBridgeScheduleRequestBody;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  if (!Array.isArray(body.mediaFiles) || !body.mediaFiles.length) {
    throw new Error("Choose media before scheduling.");
  }

  return {
    caption: normalizePostBridgeCaption(
      typeof body.caption === "string" ? body.caption : "",
    ),
    hasAudio: body.hasAudio === true,
    mediaFiles: body.mediaFiles.map((mediaFile) => {
      const item = mediaFile as PostBridgeUploadedMediaBody;

      if (
        typeof item.mediaId !== "string" ||
        typeof item.mimeType !== "string" ||
        typeof item.sizeBytes !== "number"
      ) {
        throw new Error("Unable to prepare this media upload.");
      }

      return createPostBridgeUploadedMedia({
        mediaId: item.mediaId,
        mimeType: item.mimeType,
        name: typeof item.name === "string" ? item.name : "",
        sizeBytes: item.sizeBytes,
      });
    }),
    scheduledAt: normalizePostBridgeScheduledAt(
      typeof body.scheduledAt === "string" ? body.scheduledAt : "",
    ),
    socialAccountIds: Array.isArray(body.socialAccountIds)
      ? body.socialAccountIds.filter(
          (accountId): accountId is number =>
            Number.isInteger(accountId) && accountId > 0,
        )
      : [],
    sourceId,
    sourceType: getPostBridgeSourceType(
      typeof body.sourceType === "string" ? body.sourceType : null,
    ),
    title: normalizePostBridgeTitle(
      typeof body.title === "string" ? body.title : "",
      sourceId,
    ),
  };
}
