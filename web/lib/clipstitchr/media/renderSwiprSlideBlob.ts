import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPR_EXPORT_MIME_TYPE } from "@/lib/clipstitchr/constants/swiprExportMimeType";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { createBlobFromCanvas } from "@/lib/clipstitchr/media/createBlobFromCanvas";
import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

export async function renderSwiprSlideBlob(
  backgroundBlob: Blob,
  slide: SwiprSlide,
) {
  const background = await loadImageFromBlob(backgroundBlob);
  const canvas = document.createElement("canvas");
  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create Swipr slide canvas.");
  }

  const scale = Math.max(
    TIKTOK_OUTPUT_WIDTH / background.naturalWidth,
    TIKTOK_OUTPUT_HEIGHT / background.naturalHeight,
  );
  const width = background.naturalWidth * scale;
  const height = background.naturalHeight * scale;
  const x = (TIKTOK_OUTPUT_WIDTH - width) / 2;
  const y = (TIKTOK_OUTPUT_HEIGHT - height) / 2;

  context.drawImage(background, x, y, width, height);

  if (slide.textOverlay.text.trim()) {
    drawTextOverlay(
      context,
      clampTextOverlay(slide.textOverlay, SWIPR_STATIC_DURATION),
      0,
    );
  }

  return createBlobFromCanvas(canvas, SWIPR_EXPORT_MIME_TYPE);
}
