import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

export function assertSocialPublishingSourceMediaKind(
  sourceType: SocialPublishingSourceType,
  mediaKind: SocialPublishingMediaKind,
) {
  if (sourceType === "stitch" && mediaKind !== "video") {
    throw new Error("Stitches need a finished video before scheduling.");
  }
}
