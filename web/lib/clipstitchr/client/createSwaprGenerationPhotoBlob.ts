import { createSwaprPortraitPhotoBlob } from "@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export async function createSwaprGenerationPhotoBlob(photo: PhotoAsset) {
  if (
    photo.preparation === "ai-outpaint" ||
    photo.preparation === "original-portrait" ||
    photo.preparation === "auto-crop"
  ) {
    return photo.blob;
  }

  const sourceBlob = photo.originalBlob ?? photo.blob;

  return createSwaprPortraitPhotoBlob(sourceBlob);
}
