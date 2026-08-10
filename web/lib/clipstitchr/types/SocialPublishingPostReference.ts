import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

export type SocialPublishingPostReference = {
  createdAt: string;
  hasAudio: boolean;
  isDraft?: boolean;
  mediaIds: string[];
  mediaKind: SocialPublishingMediaKind;
  platforms: SocialPublishingPlatform[];
  postId: string;
  scheduledAt?: string;
  socialAccountIds: string[];
  sourceType: SocialPublishingSourceType;
  status: SocialPublishingPostStatus;
  updatedAt: string;
};
