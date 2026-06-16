import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { createVideoClipPosterRecordId } from "@/lib/clipstitchr/utils/createVideoClipPosterRecordId";

type UploadVideoClipPosterBlobOptions = {
  blob: Blob;
  clipId: string;
};

export async function uploadVideoClipPosterBlob({
  blob,
  clipId,
}: UploadVideoClipPosterBlobOptions): Promise<R2ObjectReference> {
  const [posterObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "video-clip-poster",
      recordId: createVideoClipPosterRecordId(clipId),
    },
  ]);

  if (!posterObject) {
    throw new Error("Unable to upload this clip poster.");
  }

  return posterObject;
}
