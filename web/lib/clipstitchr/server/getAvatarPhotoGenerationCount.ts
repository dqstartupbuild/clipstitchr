import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";

export function getAvatarPhotoGenerationCount(
  value: string,
): AvatarPhotoGenerationCount {
  if (value === "1") {
    return 1;
  }

  if (value === "5") {
    return 5;
  }

  return 3;
}
