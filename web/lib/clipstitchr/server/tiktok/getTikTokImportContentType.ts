import { ACCEPTED_MUSIC_TYPES } from "@/lib/clipstitchr/constants/acceptedMusicTypes";

export function getTikTokImportContentType(rawContentType: string) {
  if ((ACCEPTED_MUSIC_TYPES as readonly string[]).includes(rawContentType)) {
    return rawContentType;
  }

  if (rawContentType === "video/mp4") {
    return "audio/mp4";
  }

  return null;
}
