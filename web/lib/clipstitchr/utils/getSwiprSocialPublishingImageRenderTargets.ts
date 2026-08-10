import {
  INSTAGRAM_FEED_OUTPUT_HEIGHT,
  INSTAGRAM_FEED_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/instagramFeedOutputSize";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export function getSwiprSocialPublishingImageRenderTargets(
  platforms: SocialPublishingPlatform[],
) {
  const includesInstagram = platforms.includes("instagram");
  const includesAnotherPlatform = platforms.some(
    (platform) => platform !== "instagram",
  );
  const verticalTarget = {
    customPlatform: null,
    height: TIKTOK_OUTPUT_HEIGHT,
    width: TIKTOK_OUTPUT_WIDTH,
  } as const;
  const instagramFeedTarget = {
    customPlatform: null,
    height: INSTAGRAM_FEED_OUTPUT_HEIGHT,
    width: INSTAGRAM_FEED_OUTPUT_WIDTH,
  } as const;

  if (!includesInstagram) {
    return [verticalTarget];
  }

  if (!includesAnotherPlatform) {
    return [instagramFeedTarget];
  }

  return [
    verticalTarget,
    {
      ...instagramFeedTarget,
      customPlatform: "instagram" as const,
    },
  ];
}
