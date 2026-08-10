import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingDefaultAccountSelection = {
  platforms: SocialPublishingPlatform[];
  socialAccountIds: string[];
};
