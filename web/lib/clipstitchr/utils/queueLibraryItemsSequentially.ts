type QueueLibraryItemsSequentiallyOptions<TItem> = {
  items: TItem[];
  onProgress?: (completedCount: number, totalCount: number, item: TItem) => void;
  onQueue: (item: TItem, index: number) => void | Promise<void>;
};

export async function queueLibraryItemsSequentially<TItem>({
  items,
  onProgress,
  onQueue,
}: QueueLibraryItemsSequentiallyOptions<TItem>) {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    await onQueue(item, index);
    onProgress?.(index + 1, items.length, item);
  }
}
