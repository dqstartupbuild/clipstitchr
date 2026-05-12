import type { AvatarImageGenerationQuality } from "@/lib/clipstitchr/types/AvatarImageGenerationQuality";

export function getAvatarPhotoPrunaOutputQuality(
  quality: AvatarImageGenerationQuality,
) {
  if (quality === "low") {
    return 70;
  }

  if (quality === "high") {
    return 90;
  }

  return 80;
}
