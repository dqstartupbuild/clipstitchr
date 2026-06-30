import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";
import { createPostBridgeMediaUploadBlob } from "@/lib/clipstitchr/utils/createPostBridgeMediaUploadBlob";

type UploadPostBridgeScheduleMediaOptions = {
  mediaFile: PostBridgeScheduleMediaFile;
  sourceId: string;
  sourceType: PostBridgeSourceType;
};

type PostBridgeMediaUploadResponse = {
  media: PostBridgeUploadedMedia;
};

export async function uploadPostBridgeScheduleMedia({
  mediaFile,
  sourceId,
  sourceType,
}: UploadPostBridgeScheduleMediaOptions): Promise<PostBridgeUploadedMedia> {
  const blob = createPostBridgeMediaUploadBlob(mediaFile);
  const [sourceObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "post-bridge-media",
      recordId: `${sourceId}-${crypto.randomUUID()}`,
    },
  ]);
  const uploadResponse = await fetch("/api/post-bridge/media/upload", {
    body: JSON.stringify({
      mimeType: blob.type,
      name: mediaFile.fileName,
      sizeBytes: blob.size,
      sourceId,
      sourceObject,
      sourceType,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!uploadResponse.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        uploadResponse,
        "Unable to upload this media to Post Bridge.",
      ),
    );
  }

  return ((await uploadResponse.json()) as PostBridgeMediaUploadResponse).media;
}
