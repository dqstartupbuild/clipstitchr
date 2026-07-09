"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getLibraryBatchScheduleStatusMessage } from "@/lib/clipstitchr/utils/getLibraryBatchScheduleStatusMessage";

type UseLibraryBatchScheduleDialogOptions<TItem> = {
  itemName: string;
  itemPluralName: string;
  items: TItem[];
  onComplete?: () => void | Promise<void>;
};

export function useLibraryBatchScheduleDialog<TItem>({
  itemName,
  itemPluralName,
  items,
  onComplete,
}: UseLibraryBatchScheduleDialogOptions<TItem>) {
  const didScheduleCurrentItem = useRef(false);
  const [batchItems, setBatchItems] = useState<TItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const activeItem = batchItems[activeIndex] ?? null;
  const isSchedulingSelected = activeItem !== null;
  const scheduleStatusMessage = useMemo(
    () =>
      getLibraryBatchScheduleStatusMessage({
        activeIndex,
        itemName,
        itemPluralName,
        scheduledCount,
        totalCount: batchItems.length,
      }),
    [
      activeIndex,
      batchItems.length,
      itemName,
      itemPluralName,
      scheduledCount,
    ],
  );

  const startSchedulingSelectedItems = useCallback(() => {
    if (!items.length || isSchedulingSelected) {
      return;
    }

    didScheduleCurrentItem.current = false;
    setBatchItems(items);
    setActiveIndex(0);
    setScheduledCount(0);
  }, [isSchedulingSelected, items]);

  const markCurrentItemScheduled = useCallback(() => {
    didScheduleCurrentItem.current = true;
    setScheduledCount((currentCount) => currentCount + 1);
  }, []);

  const closeCurrentScheduleDialog = useCallback(() => {
    const didSchedule = didScheduleCurrentItem.current;
    const didScheduleAnyItem = didSchedule || scheduledCount > 0;

    didScheduleCurrentItem.current = false;

    if (didSchedule && activeIndex + 1 < batchItems.length) {
      setActiveIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setBatchItems([]);
    setActiveIndex(0);

    if (didScheduleAnyItem) {
      void Promise.resolve(onComplete?.()).catch(() => undefined);
    }
  }, [activeIndex, batchItems.length, onComplete, scheduledCount]);

  return {
    activeIndex,
    activeItem,
    isSchedulingSelected,
    scheduleStatusMessage,
    selectedScheduleCount: batchItems.length,
    closeCurrentScheduleDialog,
    markCurrentItemScheduled,
    startSchedulingSelectedItems,
  };
}
