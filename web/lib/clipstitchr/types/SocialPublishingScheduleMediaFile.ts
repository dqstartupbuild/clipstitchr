import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export type SocialPublishingScheduleMediaFile = {
  blob: Blob;
  fileName: string;
  mediaKind: SocialPublishingMediaKind;
};
