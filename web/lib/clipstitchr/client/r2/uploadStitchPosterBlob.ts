import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { createStitchPosterRecordId } from "@/lib/clipstitchr/utils/createStitchPosterRecordId";

type UploadStitchPosterBlobOptions = {
  blob: Blob;
  stitchId: string;
};

export async function uploadStitchPosterBlob({
  blob,
  stitchId,
}: UploadStitchPosterBlobOptions): Promise<R2ObjectReference> {
  const [posterObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "stitch-poster",
      recordId: createStitchPosterRecordId(stitchId),
    },
  ]);

  if (!posterObject) {
    throw new Error("Unable to upload this stitch poster.");
  }

  return posterObject;
}
