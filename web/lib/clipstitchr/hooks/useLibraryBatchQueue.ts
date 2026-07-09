"use client";

import { useCallback, useMemo, useState } from "react";
import { getLibraryBatchQueueConfirmationMessage } from "@/lib/clipstitchr/utils/getLibraryBatchQueueConfirmationMessage";
import { queueLibraryItemsSequentially } from "@/lib/clipstitchr/utils/queueLibraryItemsSequentially";

type UseLibraryBatchQueueOptions<TItem> = {
  itemName: string;
  itemPluralName: string;
  items: TItem[];
  onComplete?: () => void | Promise<void>;
  onQueueItem: (item: TItem, index: number) => void | Promise<void>;
};

export function useLibraryBatchQueue<TItem>({
  itemName,
  itemPluralName,
  items,
  onComplete,
  onQueueItem,
}: UseLibraryBatchQueueOptions<TItem>) {
  const [isQueueingSelected, setIsQueueingSelected] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [lastQueuedCount, setLastQueuedCount] = useState(0);
  const [queueError, setQueueError] = useState<string | null>(null);
  const selectedCount = items.length;
  const queueStatusMessage = useMemo(() => {
    if (isQueueingSelected) {
      return `Queued ${queuedCount} of ${selectedCount}.`;
    }

    if (queueError) {
      return queueError;
    }

    if (lastQueuedCount > 0) {
      const label = lastQueuedCount === 1 ? itemName : itemPluralName;

      return `Added ${lastQueuedCount} ${label} to your queue.`;
    }

    return null;
  }, [
    isQueueingSelected,
    itemName,
    itemPluralName,
    lastQueuedCount,
    queueError,
    queuedCount,
    selectedCount,
  ]);

  const queueSelectedItems = useCallback(async () => {
    if (!selectedCount || isQueueingSelected) {
      return;
    }

    const didConfirm =
      typeof window === "undefined" ||
      window.confirm(
        getLibraryBatchQueueConfirmationMessage({
          count: selectedCount,
          itemName,
          itemPluralName,
        }),
      );

    if (!didConfirm) {
      return;
    }

    setIsQueueingSelected(true);
    setQueuedCount(0);
    setLastQueuedCount(0);
    setQueueError(null);

    try {
      await queueLibraryItemsSequentially({
        items,
        onProgress: (completedCount) => setQueuedCount(completedCount),
        onQueue: onQueueItem,
      });
      setLastQueuedCount(selectedCount);
      await onComplete?.();
    } catch (error) {
      setQueueError(
        error instanceof Error ? error.message : "Unable to queue those posts.",
      );
    } finally {
      setIsQueueingSelected(false);
    }
  }, [
    isQueueingSelected,
    itemName,
    itemPluralName,
    items,
    onComplete,
    onQueueItem,
    selectedCount,
  ]);

  return {
    isQueueingSelected,
    queueSelectedItems,
    queueStatusMessage,
  };
}
