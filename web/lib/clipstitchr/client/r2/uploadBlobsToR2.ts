import { createR2UploadUrl } from "@/lib/clipstitchr/client/r2/createR2UploadUrl";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadBlobToR2Item = {
  blob: Blob;
  kind: R2ObjectKind;
  recordId: string;
};

export async function uploadBlobsToR2(
  items: UploadBlobToR2Item[],
): Promise<R2ObjectReference[]> {
  const uploadUrls = await Promise.all(
    items.map((item) => createR2UploadUrl(item)),
  );

  return await Promise.all(
    uploadUrls.map((uploadUrl, index) =>
      putBlobToR2({
        blob: items[index].blob,
        contentType: uploadUrl.contentType,
        key: uploadUrl.key,
        size: uploadUrl.size,
        url: uploadUrl.url,
      }),
    ),
  );
}
