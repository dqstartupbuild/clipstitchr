import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export function assertSocialPublishingPlatformMediaKind(
  mediaKind: SocialPublishingMediaKind,
  platforms: SocialPublishingPlatform[],
) {
  if (mediaKind === "image" && platforms.includes("youtube")) {
    throw new Error(
      "YouTube Shorts needs a video. Remove YouTube or add a sound so this Swipe can be rendered as a video.",
    );
  }
}
