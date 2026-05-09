import { createR2UploadUrl } from "@/lib/clipstitchr/client/r2/createR2UploadUrl";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadBlobToR2Options = {
  blob: Blob;
  kind: R2ObjectKind;
  recordId: string;
};

export async function uploadBlobToR2({
  blob,
  kind,
  recordId,
}: UploadBlobToR2Options): Promise<R2ObjectReference> {
  const uploadUrl = await createR2UploadUrl({
    blob,
    kind,
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
