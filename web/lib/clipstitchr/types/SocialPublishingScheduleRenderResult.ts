import type { SocialPublishingScheduleMediaFile } from "@/lib/clipstitchr/types/SocialPublishingScheduleMediaFile";

export type SocialPublishingScheduleRenderResult = {
  hasAudio: boolean;
  mediaFiles: SocialPublishingScheduleMediaFile[];
};
