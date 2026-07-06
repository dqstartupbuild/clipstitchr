import { createUploadVideoJob } from "@/lib/clipstitchr/client/createUploadVideoJob";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { UploadNormalizationLayout } from "@/lib/clipstitchr/types/UploadNormalizationLayout";

type QueueUploadVideoWorkerFallbackOptions = {
  clipId: string;
  clipType: ClipType;
  file: File;
  layout?: UploadNormalizationLayout;
  productId?: string;
};

export async function queueUploadVideoWorkerFallback({
  clipId,
  clipType,
  file,
  layout,
  productId,
}: QueueUploadVideoWorkerFallbackOptions) {
  const [sourceVideoObject] = await uploadBlobsToR2([
    {
      blob: file,
      kind: "upload-source-video",
      recordId: clipId,
    },
  ]);

  if (!sourceVideoObject) {
    throw new Error("Unable to upload this video.");
  }

  return await createUploadVideoJob({
    clipId,
    clipType,
    layout,
    originalName: file.name,
    productId,
    sourceVideoObject,
  });
}
