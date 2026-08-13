import { createStudioBetaR2UploadUrl } from "@/lib/clipstitchr/client/r2/createStudioBetaR2UploadUrl";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

type UploadStudioBetaBlobToR2Options = {
  blob: Blob;
  kind: StudioBetaR2ObjectKind;
  productId: string;
  recordId: string;
};

export async function uploadStudioBetaBlobToR2(
  options: UploadStudioBetaBlobToR2Options,
) {
  const upload = await createStudioBetaR2UploadUrl(options);

  return await putBlobToR2({
    blob: options.blob,
    contentType: upload.contentType,
    key: upload.key,
    size: upload.size,
    url: upload.url,
  });
}
