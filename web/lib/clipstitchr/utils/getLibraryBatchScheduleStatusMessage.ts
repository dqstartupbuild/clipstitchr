type GetLibraryBatchScheduleStatusMessageOptions = {
  activeIndex: number;
  itemName: string;
  itemPluralName: string;
  scheduledCount: number;
  totalCount: number;
};

export function getLibraryBatchScheduleStatusMessage({
  activeIndex,
  itemName,
  itemPluralName,
  scheduledCount,
  totalCount,
}: GetLibraryBatchScheduleStatusMessageOptions) {
  if (totalCount > 0) {
    return `Reviewing ${activeIndex + 1} of ${totalCount}.`;
  }

  if (scheduledCount > 0) {
    const label = scheduledCount === 1 ? itemName : itemPluralName;

    return `Finished ${scheduledCount} ${label}.`;
  }

  return null;
}
