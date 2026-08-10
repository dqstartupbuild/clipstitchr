import { getSocialPublishingMediaKindFromMimeType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingMediaKindFromMimeType";
import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export function resolveSocialPublishingMediaKindForFiles(
  files: File[],
): SocialPublishingMediaKind {
  const mediaKinds = files.map((file) =>
    getSocialPublishingMediaKindFromMimeType(file.type),
  );
  const mediaKind = mediaKinds[0];

  if (!mediaKind || mediaKinds.some((kind) => kind !== mediaKind)) {
    throw new Error("Schedule either images or one video, not both.");
  }

  if (mediaKind === "video" && files.length > 1) {
    throw new Error("Schedule one video at a time.");
  }

  return mediaKind;
}
