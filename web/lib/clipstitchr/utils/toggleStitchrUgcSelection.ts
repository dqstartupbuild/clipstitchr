import { maxStitchrUgcSelectionCount } from "@/lib/clipstitchr/constants/maxStitchrUgcSelectionCount";

export function toggleStitchrUgcSelection(
  selectedIds: string[],
  id: string,
  maxCount = maxStitchrUgcSelectionCount,
) {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((selectedId) => selectedId !== id);
  }

  if (selectedIds.length >= maxCount) {
    return selectedIds;
  }

  return [...selectedIds, id];
}
