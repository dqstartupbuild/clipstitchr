import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { PostBridgeBatchPreparedMedia } from "@/lib/clipstitchr/types/PostBridgeBatchPreparedMedia";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import { createPostBridgeMediaUploadBlob } from "@/lib/clipstitchr/utils/createPostBridgeMediaUploadBlob";
import { createId } from "@/lib/clipstitchr/utils/createId";

type UploadPostBridgeBatchMediaFileOptions = {
  mediaFile: PostBridgeScheduleMediaFile;
  sourceId: string;
};

export async function uploadPostBridgeBatchMediaFile({
  mediaFile,
  sourceId,
}: UploadPostBridgeBatchMediaFileOptions): Promise<PostBridgeBatchPreparedMedia> {
  const blob = createPostBridgeMediaUploadBlob(mediaFile);
  const [sourceObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "post-bridge-media",
      recordId: `${sourceId}-${createId()}`,
    },
  ]);

  return {
    media: {
      mediaKind: mediaFile.mediaKind,
      mimeType: blob.type,
      name: mediaFile.fileName,
      sizeBytes: blob.size,
    },
    sourceObject,
  };
}
