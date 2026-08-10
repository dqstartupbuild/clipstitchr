import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingScheduleMediaFile = {
  blob: Blob;
  customPlatform?: SocialPublishingPlatform;
  fileName: string;
  mediaKind: SocialPublishingMediaKind;
};
