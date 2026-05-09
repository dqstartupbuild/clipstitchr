import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";

export function getAvatarPhotoGenerationCount(
  value: string,
): AvatarPhotoGenerationCount {
  if (value === "5") {
    return 5;
  }

  if (value === "10") {
    return 10;
  }

  return 3;
}
