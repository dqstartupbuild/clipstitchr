import { uploadStudioBetaBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadStudioBetaBlobToR2";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { toR2ObjectReference } from "@/lib/clipstitchr/client/r2/toR2ObjectReference";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";

type UploadStudioEditorExportObjectsOptions = {
  clipId: string;
  productId: string;
  videoBlob: Blob;
};

export async function uploadStudioEditorExportObjects({
  clipId,
  productId,
  videoBlob,
}: UploadStudioEditorExportObjectsOptions) {
  const posterBlob = await createVideoPosterBlob(videoBlob);
  const videoObject = await uploadStudioBetaBlobToR2({
    blob: videoBlob,
    kind: "media-output",
    productId,
    recordId: clipId,
  });

  try {
    const posterObject = await uploadStudioBetaBlobToR2({
      blob: posterBlob,
      kind: "poster",
      productId,
      recordId: `${clipId}-poster`,
    });

    return {
      posterObject: toR2ObjectReference(posterObject),
      videoObject: toR2ObjectReference(videoObject),
    };
  } catch (error) {
    await deleteObjectsFromR2([videoObject]).catch(() => undefined);
    throw new Error(
      error instanceof Error
        ? `The video uploaded, but its poster did not: ${error.message}`
        : "The video uploaded, but its poster did not.",
    );
  }
}
