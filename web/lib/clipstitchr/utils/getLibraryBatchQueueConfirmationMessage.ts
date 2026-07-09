type GetLibraryBatchQueueConfirmationMessageOptions = {
  count: number;
  itemName: string;
  itemPluralName: string;
};

export function getLibraryBatchQueueConfirmationMessage({
  count,
  itemName,
  itemPluralName,
}: GetLibraryBatchQueueConfirmationMessageOptions) {
  const label = count === 1 ? itemName : itemPluralName;

  return `Add ${count} ${label} to your Post Bridge queue?`;
}
