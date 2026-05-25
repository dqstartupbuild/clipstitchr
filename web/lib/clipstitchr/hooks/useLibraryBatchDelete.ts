"use client";

import { useCallback, useMemo, useState } from "react";
import { deleteLibraryItems } from "@/lib/clipstitchr/utils/deleteLibraryItems";
import { getLibraryBatchDeleteConfirmationMessage } from "@/lib/clipstitchr/utils/getLibraryBatchDeleteConfirmationMessage";

type UseLibraryBatchDeleteOptions = {
  itemIds: string[];
  itemName: string;
  itemPluralName: string;
  onDelete: (id: string) => void | Promise<void>;
};

export function useLibraryBatchDelete({
  itemIds,
  itemName,
  itemPluralName,
  onDelete,
}: UseLibraryBatchDeleteOptions) {
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedIdList = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const selectedCount = selectedIds.size;
  const areAllVisibleItemsSelected =
    itemIds.length > 0 && itemIds.every((id) => selectedIds.has(id));

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectVisibleItems = useCallback(() => {
    setSelectedIds((currentIds) => new Set([...currentIds, ...itemIds]));
  }, [itemIds]);

  const startSelecting = useCallback(() => {
    setIsSelecting(true);
  }, []);

  const stopSelecting = useCallback(() => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setIsSelecting(true);
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      return nextIds;
    });
  }, []);

  const deleteSelectedItems = useCallback(async () => {
    if (!selectedCount) {
      return;
    }

    const didConfirm =
      typeof window === "undefined" ||
      window.confirm(
        getLibraryBatchDeleteConfirmationMessage({
          count: selectedCount,
          itemName,
          itemPluralName,
        }),
      );

    if (!didConfirm) {
      return;
    }

    setIsDeletingSelected(true);

    try {
      await deleteLibraryItems(selectedIdList, onDelete);
      setSelectedIds(new Set());
      setIsSelecting(false);
    } finally {
      setIsDeletingSelected(false);
    }
  }, [itemName, itemPluralName, onDelete, selectedCount, selectedIdList]);

  return {
    areAllVisibleItemsSelected,
    clearSelection,
    deleteSelectedItems,
    isDeletingSelected,
    isSelecting,
    selectVisibleItems,
    selectedCount,
    selectedIds,
    startSelecting,
    stopSelecting,
    toggleItemSelection,
    visibleItemCount: itemIds.length,
  };
}
