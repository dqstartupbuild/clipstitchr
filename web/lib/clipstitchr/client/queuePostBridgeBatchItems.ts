import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";
import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type QueuePostBridgeBatchItemsOptions = {
  captions: string[];
  items: PostBridgeBatchQueueItem[];
  musicTrack: SharedMusicTrack | null;
  platforms: PostBridgePlatform[];
  socialAccountIds: number[];
  onCompletedCountChange: (count: number) => void;
  onProgressChange: (progress: number) => void;
};

export async function queuePostBridgeBatchItems({
  captions,
  items,
  musicTrack,
  platforms,
  socialAccountIds,
  onCompletedCountChange,
  onProgressChange,
}: QueuePostBridgeBatchItemsOptions) {
  for (const [index, item] of items.entries()) {
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

    await schedulePostBridgePost({
      caption: captions[index] ?? "",
      hasAudio: Boolean(musicTrack) || renderResult.hasAudio,
      mediaFiles: renderResult.mediaFiles,
      socialAccountIds,
      sourceId: item.id,
      sourceType: item.sourceType,
      title: item.title,
      useQueue: true,
    });
    onCompletedCountChange(index + 1);
    onProgressChange((index + 1) / items.length);
  }
}
