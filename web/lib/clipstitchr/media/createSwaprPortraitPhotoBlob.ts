import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { createBlobFromCanvas } from "@/lib/clipstitchr/media/createBlobFromCanvas";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";

const SWAPR_PORTRAIT_PHOTO_QUALITY = 0.92;

export async function createSwaprPortraitPhotoBlob(blob: Blob): Promise<Blob> {
  const image = await loadImageFromBlob(blob);
  const canvas = document.createElement("canvas");
  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create Swapr portrait photo canvas.");
  }

  const scale = Math.max(
    TIKTOK_OUTPUT_WIDTH / image.naturalWidth,
    TIKTOK_OUTPUT_HEIGHT / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (TIKTOK_OUTPUT_WIDTH - width) / 2;
  const y = (TIKTOK_OUTPUT_HEIGHT - height) / 2;

  context.drawImage(image, x, y, width, height);

  return createBlobFromCanvas(
    canvas,
    "image/jpeg",
    SWAPR_PORTRAIT_PHOTO_QUALITY,
  );
}
