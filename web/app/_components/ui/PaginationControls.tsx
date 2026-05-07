import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";

type PaginationControlsProps = {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  visibleEnd: number;
  visibleStart: number;
  onNext: () => void;
  onPrevious: () => void;
};

export function PaginationControls({
  canGoNext,
  canGoPrevious,
  currentPage,
  totalItems,
  totalPages,
  visibleEnd,
  visibleStart,
  onNext,
  onPrevious,
}: PaginationControlsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-text-secondary">
        {visibleStart}-{visibleEnd} of {totalItems}
      </p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm font-semibold text-text-tertiary">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <IconButton
            label="Go to previous page"
            icon={<ChevronLeft aria-hidden className="h-4 w-4" />}
            onClick={onPrevious}
            disabled={!canGoPrevious}
          />
          <IconButton
            label="Go to next page"
            icon={<ChevronRight aria-hidden className="h-4 w-4" />}
            onClick={onNext}
            disabled={!canGoNext}
          />
        </div>
      </div>
    </div>
  );
}
