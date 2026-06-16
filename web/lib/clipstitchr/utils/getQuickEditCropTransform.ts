import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";

export function getQuickEditCropTransform(crop?: QuickEditCrop | null) {
  if (!crop) {
    return undefined;
  }

  return `translate(${(crop.positionX ?? 0) * 50}%, ${(crop.positionY ?? 0) * 50}%) scale(${crop.scale ?? 1})`;
}
