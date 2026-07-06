import { createPostBridgeUploadedMedia } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadedMedia";
import { createPostBridgeUploadUrl } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl";
import { normalizePostBridgeMediaMimeType } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeMediaMimeType";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadPostBridgeMediaFromR2ObjectOptions = {
  apiKey: string;
  deleteSourceObject?: boolean;
  media: PostBridgeMediaUploadDescriptor;
  sourceObject: R2ObjectReference;
  userId: string;
};

type StreamingRequestInit = RequestInit & {
  duplex: "half";
};

export async function uploadPostBridgeMediaFromR2Object({
  apiKey,
  deleteSourceObject: shouldDeleteSourceObject = true,
  media,
  sourceObject,
  userId,
}: UploadPostBridgeMediaFromR2ObjectOptions): Promise<PostBridgeUploadedMedia> {
  assertR2ObjectKeyBelongsToUser(sourceObject.key, userId);

  if (
    normalizePostBridgeMediaMimeType(sourceObject.contentType) !== media.mimeType ||
    sourceObject.size !== media.sizeBytes
  ) {
    throw new Error("Unable to load the rendered media upload.");
  }

  const [{ url: downloadUrl }, upload] = await Promise.all([
    getR2DownloadSignedUrl(sourceObject.key),
    createPostBridgeUploadUrl({
      apiKey,
      mimeType: media.mimeType,
      name: media.name,
      sizeBytes: media.sizeBytes,
    }),
  ]);
  const sourceResponse = await fetch(downloadUrl);

  if (!sourceResponse.ok || !sourceResponse.body) {
    throw new Error("Unable to load the rendered media upload.");
  }

  const uploadResponse = await fetch(upload.upload_url, {
    body: sourceResponse.body,
    duplex: "half",
    headers: {
      "Content-Length": String(media.sizeBytes),
      "Content-Type": media.mimeType,
    },
    method: "PUT",
  } as StreamingRequestInit);

  if (!uploadResponse.ok) {
    throw new Error(
      `Post Bridge media upload failed with status ${uploadResponse.status}.`,
    );
  }

  if (shouldDeleteSourceObject) {
    await deleteR2Object(sourceObject.key).catch(() => undefined);
  }

  return createPostBridgeUploadedMedia({
    mediaId: upload.media_id,
    mimeType: media.mimeType,
    name: upload.name || media.name,
    sizeBytes: media.sizeBytes,
  });
}
