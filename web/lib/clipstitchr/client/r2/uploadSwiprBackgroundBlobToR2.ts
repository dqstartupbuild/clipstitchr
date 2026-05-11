import { createSwiprBackgroundUploadUrl } from "@/lib/clipstitchr/client/r2/createSwiprBackgroundUploadUrl";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
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

  return await putBlobToR2({
    blob,
    contentType: uploadUrl.contentType,
    key: uploadUrl.key,
    size: uploadUrl.size,
    url: uploadUrl.url,
  });
}
