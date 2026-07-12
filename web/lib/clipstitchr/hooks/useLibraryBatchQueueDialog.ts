"use client";

import { useCallback, useState } from "react";

export function useLibraryBatchQueueDialog<TItem>(items: TItem[]) {
  const [queuedItems, setQueuedItems] = useState<TItem[]>([]);

  const openBatchQueueDialog = useCallback(() => {
    if (items.length) {
      setQueuedItems(items);
    }
  }, [items]);

  const closeBatchQueueDialog = useCallback(() => {
    setQueuedItems([]);
  }, []);

  return {
    closeBatchQueueDialog,
    isBatchQueueDialogOpen: queuedItems.length > 0,
    openBatchQueueDialog,
    queuedItems,
  };
}
