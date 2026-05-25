"use client";

import { CheckSquare, Trash2, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type LibraryBatchActionBarProps = {
  areAllVisibleItemsSelected: boolean;
  isDeletingSelected: boolean;
  isSelecting: boolean;
  selectedCount: number;
  visibleItemCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onSelectVisible: () => void;
  onStartSelecting: () => void;
  onStopSelecting: () => void;
};

export function LibraryBatchActionBar({
  areAllVisibleItemsSelected,
  isDeletingSelected,
  isSelecting,
  selectedCount,
  visibleItemCount,
  onClearSelection,
  onDeleteSelected,
  onSelectVisible,
  onStartSelecting,
  onStopSelecting,
}: LibraryBatchActionBarProps) {
  if (!isSelecting) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<CheckSquare aria-hidden className="h-4 w-4" />}
        disabled={visibleItemCount === 0}
        onClick={onStartSelecting}
      >
        Select
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-sm font-semibold text-text-tertiary">
        {selectedCount} selected
      </span>
      <Button
        type="button"
        variant="subtle"
        size="sm"
        disabled={
          visibleItemCount === 0 ||
          areAllVisibleItemsSelected ||
          isDeletingSelected
        }
        onClick={onSelectVisible}
      >
        Select page
      </Button>
      <Button
        type="button"
        variant="subtle"
        size="sm"
        disabled={selectedCount === 0 || isDeletingSelected}
        onClick={onClearSelection}
      >
        Clear
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        icon={<Trash2 aria-hidden className="h-4 w-4" />}
        isLoading={isDeletingSelected}
        disabled={selectedCount === 0}
        onClick={onDeleteSelected}
      >
        Delete selected
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<X aria-hidden className="h-4 w-4" />}
        disabled={isDeletingSelected}
        onClick={onStopSelecting}
      >
        Done
      </Button>
    </div>
  );
}
