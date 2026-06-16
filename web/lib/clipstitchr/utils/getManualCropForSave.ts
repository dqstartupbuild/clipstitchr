import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";

export function getManualCropForSave(crop: QuickEditCrop) {
  return crop.scale === 1 && !crop.positionX && !crop.positionY ? null : crop;
}
