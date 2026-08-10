import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

type GetSwiprSocialPublishingMediaKindOptions = {
  hasMusic: boolean;
  platforms: SocialPublishingPlatform[];
};

export function getSwiprSocialPublishingMediaKind({
  hasMusic,
  platforms,
}: GetSwiprSocialPublishingMediaKindOptions): SocialPublishingMediaKind {
  return hasMusic || platforms.includes("youtube") ? "video" : "image";
}
