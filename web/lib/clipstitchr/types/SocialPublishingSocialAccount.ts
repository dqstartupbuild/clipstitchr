import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingSocialAccount = {
  displayName: string;
  id: string;
  isActive: boolean;
  needsReconnection: boolean;
  platform: SocialPublishingPlatform;
  profileId: string;
  tiktokCanPostMore?: boolean;
  tiktokPrivacyLevels?: SocialPublishingTikTokPrivacyLevel[];
  username: string;
};

type SocialPublishingTikTokPrivacyLevel = {
  label: string;
  value: string;
};
