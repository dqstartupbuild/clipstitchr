import { createSwiprBackgroundUploadUrl } from "@/lib/clipstitchr/client/r2/createSwiprBackgroundUploadUrl";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import { toR2ObjectReference } from "@/lib/clipstitchr/client/r2/toR2ObjectReference";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadSwiprBackgroundBlobToR2Options = {
  blob: Blob;
  recordId: string;
};

export async function uploadSwiprBackgroundBlobToR2({
  blob,
  recordId,
}: UploadSwiprBackgroundBlobToR2Options): Promise<R2ObjectReference> {
  const uploadUrl = await createSwiprBackgroundUploadUrl({
    blob,
    recordId,
  });

  const uploadedObject = await putBlobToR2({
    blob,
    contentType: uploadUrl.contentType,
    key: uploadUrl.key,
    size: uploadUrl.size,
    url: uploadUrl.url,
  });

  return toR2ObjectReference(uploadedObject);
}
