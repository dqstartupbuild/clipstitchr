import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";
import { createPostBridgeMediaUploadBlob } from "@/lib/clipstitchr/utils/createPostBridgeMediaUploadBlob";

type UploadPostBridgeScheduleMediaOptions = {
  mediaFile: PostBridgeScheduleMediaFile;
  sourceId: string;
  sourceType: PostBridgeSourceType;
};

type PostBridgeMediaUploadUrlResponse = {
  media: PostBridgeUploadedMedia;
  uploadUrl: string;
};

export async function uploadPostBridgeScheduleMedia({
  mediaFile,
  sourceId,
  sourceType,
}: UploadPostBridgeScheduleMediaOptions): Promise<PostBridgeUploadedMedia> {
  const blob = createPostBridgeMediaUploadBlob(mediaFile);
  const uploadUrlResponse = await fetch("/api/post-bridge/media/upload-url", {
    body: JSON.stringify({
      mimeType: blob.type,
      name: mediaFile.fileName,
      sizeBytes: blob.size,
      sourceId,
      sourceType,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!uploadUrlResponse.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        uploadUrlResponse,
        "Unable to prepare this media upload.",
      ),
    );
  }

  const upload = (await uploadUrlResponse.json()) as PostBridgeMediaUploadUrlResponse;
  const mediaUploadResponse = await fetch(upload.uploadUrl, {
    body: blob,
    headers: {
      "Content-Type": upload.media.mimeType,
    },
    method: "PUT",
  });

  if (!mediaUploadResponse.ok) {
    throw new Error("Unable to upload this media to Post Bridge.");
  }

  return upload.media;
}
