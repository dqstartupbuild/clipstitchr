import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";

export async function uploadSocialPostAssets(
  postId: string,
  mediaFiles: PostBridgeScheduleMediaFile[],
) {
  const objects = await uploadBlobsToR2(
    mediaFiles.map((mediaFile, index) => ({
      blob: mediaFile.blob,
      kind: "social-post-asset",
      recordId: `${postId}-${index}-${crypto.randomUUID()}`,
    })),
  );

  return objects.map((object, index) => ({
    id: crypto.randomUUID(),
    order: index,
    kind: mediaFiles[index].mediaKind,
    objectKey: object.key,
    contentType: object.contentType,
    sizeBytes: object.size,
    durationSeconds: mediaFiles[index].durationSeconds,
    height: mediaFiles[index].height,
    width: mediaFiles[index].width,
  }));
}
