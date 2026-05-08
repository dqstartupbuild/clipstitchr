import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { createBlobFromCanvas } from "@/lib/clipstitchr/media/createBlobFromCanvas";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";
import type { SwaprOutpaintInputs } from "@/lib/clipstitchr/types/SwaprOutpaintInputs";

export async function createSwaprOutpaintInputs(
  blob: Blob,
): Promise<SwaprOutpaintInputs> {
  const image = await loadImageFromBlob(blob);
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = TIKTOK_OUTPUT_WIDTH;
  imageCanvas.height = TIKTOK_OUTPUT_HEIGHT;

  const imageContext = imageCanvas.getContext("2d");

  if (!imageContext) {
    throw new Error("Unable to create Swapr outpaint image canvas.");
  }

  const scale = Math.min(
    TIKTOK_OUTPUT_WIDTH / image.naturalWidth,
    TIKTOK_OUTPUT_HEIGHT / image.naturalHeight,
  );
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const x = Math.round((TIKTOK_OUTPUT_WIDTH - width) / 2);
  const y = Math.round((TIKTOK_OUTPUT_HEIGHT - height) / 2);

  imageContext.fillStyle = "#111827";
  imageContext.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
  imageContext.imageSmoothingEnabled = true;
  imageContext.imageSmoothingQuality = "high";
  imageContext.filter = "blur(24px)";
  imageContext.drawImage(
    image,
    x - 24,
    y - 24,
    width + 48,
    height + 48,
  );
  imageContext.filter = "none";
  imageContext.fillStyle = "rgba(17, 24, 39, 0.12)";
  imageContext.fillRect(0, 0, imageCanvas.width, imageCanvas.height);

  imageContext.drawImage(image, x, y, width, height);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = TIKTOK_OUTPUT_WIDTH;
  maskCanvas.height = TIKTOK_OUTPUT_HEIGHT;

  const maskContext = maskCanvas.getContext("2d");

  if (!maskContext) {
    throw new Error("Unable to create Swapr outpaint mask canvas.");
  }

  maskContext.fillStyle = "#ffffff";
  maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskContext.fillStyle = "#000000";
  maskContext.fillRect(x, y, width, height);

  return {
    imageBlob: await createBlobFromCanvas(imageCanvas, "image/png"),
    maskBlob: await createBlobFromCanvas(maskCanvas, "image/png"),
    sourceRect: { x, y, width, height },
  };
}
