import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingFollowerAccount = {
  accountId: string;
  currentFollowers: number;
  growth: number;
  growthPercentage: number;
  platform: SocialPublishingPlatform;
  username: string;
};

export type SocialPublishingFollowerPoint = {
  date: string;
  followers: number;
};

export type SocialPublishingFollowerStats = {
  accounts: SocialPublishingFollowerAccount[];
  historyByAccountId: Record<string, SocialPublishingFollowerPoint[]>;
};
