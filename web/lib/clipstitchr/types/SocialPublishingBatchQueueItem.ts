import type { SocialPublishingScheduleRenderOptions } from "@/lib/clipstitchr/types/SocialPublishingScheduleRenderOptions";
import type { SocialPublishingScheduleRenderResult } from "@/lib/clipstitchr/types/SocialPublishingScheduleRenderResult";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

export type SocialPublishingBatchQueueItem = {
  caption: string;
  id: string;
  productId?: string;
  sourceType: SocialPublishingSourceType;
  title: string;
  renderMedia: (
    options: SocialPublishingScheduleRenderOptions,
  ) => Promise<SocialPublishingScheduleRenderResult>;
};
