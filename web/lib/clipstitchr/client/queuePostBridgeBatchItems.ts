import { submitPostBridgeBatch } from "@/lib/clipstitchr/client/submitPostBridgeBatch";
import { uploadPostBridgeBatchMediaFile } from "@/lib/clipstitchr/client/uploadPostBridgeBatchMediaFile";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { shufflePostBridgeBatchEntries } from "@/lib/clipstitchr/utils/shufflePostBridgeBatchEntries";

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
  const entries = shufflePostBridgeBatchEntries(
    items.map((item, index) => ({
      caption: captions[index] ?? "",
      item,
    })),
  );
  const preparedItems = [];
  const temporaryObjects = [];

  try {
    for (let index = 0; index < entries.length; index += 1) {
      const { caption, item } = entries[index];

      onCompletedCountChange(index);
      const renderResult = await item.renderMedia({
        musicTrack,
        onProgress: (itemProgress) =>
          onProgressChange((index + itemProgress * 0.7) / entries.length),
        platforms,
      });

      if (!renderResult.mediaFiles.length) {
        throw new Error(`Draft ${index + 1} has no media to queue.`);
      }

      const mediaFiles = [];

      for (const mediaFile of renderResult.mediaFiles) {
        const preparedMedia = await uploadPostBridgeBatchMediaFile({
          mediaFile,
          sourceId: item.id,
        });

        mediaFiles.push(preparedMedia);
        temporaryObjects.push(preparedMedia.sourceObject);
      }

      preparedItems.push({
        caption,
        hasAudio: Boolean(musicTrack) || renderResult.hasAudio,
        sourceId: item.id,
        sourceType: item.sourceType,
        title: item.title,
        mediaFiles,
      });
      onCompletedCountChange(index + 1);
      onProgressChange((index + 0.9) / entries.length);
    }

    await submitPostBridgeBatch({
      items: preparedItems,
      socialAccountIds,
    });
    onProgressChange(1);
  } catch (error) {
    await deleteObjectsFromR2(temporaryObjects).catch(() => undefined);
    throw error;
  }
}
