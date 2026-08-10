import { scheduleSocialPublishingPost } from "@/lib/clipstitchr/client/scheduleSocialPublishingPost";
import type { SocialPublishingBatchQueueItem } from "@/lib/clipstitchr/types/SocialPublishingBatchQueueItem";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type QueueSocialPublishingBatchItemsOptions = {
  captions: string[];
  items: SocialPublishingBatchQueueItem[];
  musicTrack: SharedMusicTrack | null;
  platforms: SocialPublishingPlatform[];
  socialAccountIds: string[];
  onCompletedCountChange: (count: number) => void;
  onProgressChange: (progress: number) => void;
  startIndex?: number;
  tiktokCommercialContentType: SocialPublishingTikTokCommercialContentType;
  tiktokConsentGiven: boolean;
  tiktokPrivacyLevel: string;
};

export async function queueSocialPublishingBatchItems({
  captions,
  items,
  musicTrack,
  platforms,
  socialAccountIds,
  onCompletedCountChange,
  onProgressChange,
  startIndex = 0,
  tiktokCommercialContentType,
  tiktokConsentGiven,
  tiktokPrivacyLevel,
}: QueueSocialPublishingBatchItemsOptions) {
  for (let index = startIndex; index < items.length; index += 1) {
    const item = items[index];

    onCompletedCountChange(index);
    const renderResult = await item.renderMedia({
      musicTrack,
      onProgress: (itemProgress) =>
        onProgressChange((index + itemProgress * 0.8) / items.length),
      platforms,
    });

    if (!renderResult.mediaFiles.length) {
      throw new Error(`Draft ${index + 1} has no media to queue.`);
    }

    await scheduleSocialPublishingPost({
      caption: captions[index] ?? "",
      hasAudio: Boolean(musicTrack) || renderResult.hasAudio,
      mediaFiles: renderResult.mediaFiles,
      socialAccountIds,
      sourceId: item.id,
      sourceType: item.sourceType,
      title: item.title,
      tiktokCommercialContentType,
      tiktokConsentGiven,
      tiktokPrivacyLevel,
      useQueue: true,
    });
    onCompletedCountChange(index + 1);
    onProgressChange((index + 1) / items.length);
  }
}
