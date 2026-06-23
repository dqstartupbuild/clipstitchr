import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadNormalizedVideoClipObjectsOptions = {
  clipId: string;
  posterBlob: Blob;
  videoBlob: Blob;
};

type UploadNormalizedVideoClipObjectsResult = {
  posterObject: R2ObjectReference;
  videoObject: R2ObjectReference;
};

export async function uploadNormalizedVideoClipObjects({
  clipId,
  posterBlob,
  videoBlob,
}: UploadNormalizedVideoClipObjectsOptions): Promise<UploadNormalizedVideoClipObjectsResult> {
  const [videoObject, posterObject] = await uploadBlobsToR2([
    {
      blob: videoBlob,
      kind: "video-clip-video",
      recordId: clipId,
    },
    {
      blob: posterBlob,
      kind: "video-clip-poster",
      recordId: clipId,
    },
  ]);

  if (!videoObject || !posterObject) {
    throw new Error("Unable to upload this video.");
  }

  return {
    posterObject,
    videoObject,
  };
}
