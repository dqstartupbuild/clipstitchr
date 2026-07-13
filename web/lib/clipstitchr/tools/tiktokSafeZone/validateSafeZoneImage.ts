import { safeZoneImageLimits } from "@/lib/clipstitchr/tools/tiktokSafeZone/safeZoneImageLimits";

export function validateSafeZoneImage(file: File) {
  if (!safeZoneImageLimits.acceptedTypes.some((type) => type === file.type)) {
    return "Choose a JPG, PNG, or WebP image.";
  }
  if (file.size > safeZoneImageLimits.maxBytes) {
    return "Choose an image smaller than 20 MB.";
  }

  return null;
}
