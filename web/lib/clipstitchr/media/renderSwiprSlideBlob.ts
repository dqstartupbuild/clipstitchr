import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPR_EXPORT_MIME_TYPE } from "@/lib/clipstitchr/constants/swiprExportMimeType";
import { createBlobFromCanvas } from "@/lib/clipstitchr/media/createBlobFromCanvas";
import { drawSwiprSlideToCanvas } from "@/lib/clipstitchr/media/drawSwiprSlideToCanvas";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

export async function renderSwiprSlideBlob(
  backgroundBlob: Blob,
  slide: SwiprSlide,
  output: { mimeType: string; quality?: number } = {
    mimeType: SWIPR_EXPORT_MIME_TYPE,
  },
) {
  const background = await loadImageFromBlob(backgroundBlob);
  const canvas = document.createElement("canvas");
  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create Swipr slide canvas.");
  }

  drawSwiprSlideToCanvas(context, background, slide);

  return output.quality === undefined
    ? createBlobFromCanvas(canvas, output.mimeType)
    : createBlobFromCanvas(canvas, output.mimeType, output.quality);
}
