import type { SocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/types/SocialPublishingMediaUploadDescriptor";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingUploadedMedia = SocialPublishingMediaUploadDescriptor & {
  customPlatform?: SocialPublishingPlatform;
  mediaId: string;
};
