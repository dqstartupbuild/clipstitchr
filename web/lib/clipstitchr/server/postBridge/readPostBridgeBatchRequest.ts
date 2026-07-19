import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import { getPostBridgeSourceType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceType";
import { normalizePostBridgeCaption } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeCaption";
import { normalizePostBridgeTitle } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeTitle";
import { readPostBridgeBatchSourceObject } from "@/lib/clipstitchr/server/postBridge/readPostBridgeBatchSourceObject";
import type { PostBridgeBatchJobInput } from "@/lib/clipstitchr/types/PostBridgeBatchJobInput";

const MAX_BATCH_ITEMS = 20;

export async function readPostBridgeBatchRequest(
  request: Request,
): Promise<PostBridgeBatchJobInput> {
  const body = (await request.json()) as Record<string, unknown>;

  if (
    !Array.isArray(body.items) ||
    !body.items.length ||
    body.items.length > MAX_BATCH_ITEMS
  ) {
    throw new Error("Choose between 1 and 20 posts for this batch.");
  }

  const socialAccountIds = Array.isArray(body.socialAccountIds)
    ? [
        ...new Set(
          body.socialAccountIds.filter(
            (accountId): accountId is number =>
              Number.isInteger(accountId) && Number(accountId) > 0,
          ),
        ),
      ]
    : [];

  if (!socialAccountIds.length) {
    throw new Error("Choose connected accounts before scheduling.");
  }

  return {
    socialAccountIds,
    items: body.items.map((value) => {
      const item = value as Record<string, unknown>;
      const sourceId =
        typeof item.sourceId === "string" ? item.sourceId.trim() : "";

      if (!sourceId || !Array.isArray(item.mediaFiles) || !item.mediaFiles.length) {
        throw new Error("Choose media before scheduling.");
      }

      return {
        caption: normalizePostBridgeCaption(
          typeof item.caption === "string" ? item.caption : "",
        ),
        hasAudio: item.hasAudio === true,
        mediaFiles: item.mediaFiles.map((value) => {
          const preparedMedia = value as Record<string, unknown>;
          const media = preparedMedia.media as Record<string, unknown> | null;

          if (
            !media ||
            typeof media.mimeType !== "string" ||
            typeof media.sizeBytes !== "number"
          ) {
            throw new Error("Unable to prepare this media upload.");
          }

          return {
            media: createPostBridgeMediaUploadDescriptor({
              mimeType: media.mimeType,
              name: typeof media.name === "string" ? media.name : "",
              sizeBytes: media.sizeBytes,
            }),
            sourceObject: readPostBridgeBatchSourceObject(
              preparedMedia.sourceObject,
            ),
          };
        }),
        sourceId,
        sourceType: getPostBridgeSourceType(
          typeof item.sourceType === "string" ? item.sourceType : null,
        ),
        title: normalizePostBridgeTitle(
          typeof item.title === "string" ? item.title : "",
          sourceId,
        ),
      };
    }),
  };
}
