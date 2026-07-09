"use client";

import { CalendarClock, CheckSquare, Trash2, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type LibraryBatchActionBarProps = {
  areAllVisibleItemsSelected: boolean;
  isDeletingSelected: boolean;
  isQueueingSelected?: boolean;
  isSelecting: boolean;
  queueStatusMessage?: string | null;
  selectedCount: number;
  visibleItemCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onQueueSelected?: () => void;
  onSelectVisible: () => void;
  onStartSelecting: () => void;
  onStopSelecting: () => void;
};

export function LibraryBatchActionBar({
  areAllVisibleItemsSelected,
  isDeletingSelected,
  isQueueingSelected = false,
  isSelecting,
  queueStatusMessage = null,
  selectedCount,
  visibleItemCount,
  onClearSelection,
  onDeleteSelected,
  onQueueSelected,
  onSelectVisible,
  onStartSelecting,
  onStopSelecting,
}: LibraryBatchActionBarProps) {
  const isBusy = isDeletingSelected || isQueueingSelected;

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
          isBusy
        }
        onClick={onSelectVisible}
      >
        Select page
      </Button>
      <Button
        type="button"
        variant="subtle"
        size="sm"
        disabled={selectedCount === 0 || isBusy}
        onClick={onClearSelection}
      >
        Clear
      </Button>
      {onQueueSelected ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<CalendarClock aria-hidden className="h-4 w-4" />}
          isLoading={isQueueingSelected}
          disabled={selectedCount === 0 || isDeletingSelected}
          onClick={onQueueSelected}
        >
          {isQueueingSelected ? "Reviewing..." : "Queue selected"}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="danger"
        size="sm"
        icon={<Trash2 aria-hidden className="h-4 w-4" />}
        isLoading={isDeletingSelected}
        disabled={selectedCount === 0 || isQueueingSelected}
        onClick={onDeleteSelected}
      >
        Delete selected
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<X aria-hidden className="h-4 w-4" />}
        disabled={isBusy}
        onClick={onStopSelecting}
      >
        Done
      </Button>
      {queueStatusMessage ? (
        <span className="basis-full text-right text-sm font-semibold text-text-secondary">
          {queueStatusMessage}
        </span>
      ) : null}
    </div>
  );
}
