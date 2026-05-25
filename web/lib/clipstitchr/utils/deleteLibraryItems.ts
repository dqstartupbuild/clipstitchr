export async function deleteLibraryItems(
  ids: string[],
  onDelete: (id: string) => void | Promise<void>,
) {
  for (const id of ids) {
    await onDelete(id);
  }
}
