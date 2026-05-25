type LibraryBatchDeleteConfirmationMessageOptions = {
  count: number;
  itemName: string;
  itemPluralName: string;
};

export function getLibraryBatchDeleteConfirmationMessage({
  count,
  itemName,
  itemPluralName,
}: LibraryBatchDeleteConfirmationMessageOptions) {
  const label = count === 1 ? itemName : itemPluralName;

  return `Delete ${count} selected ${label}?\n\nThis cannot be undone.`;
}
