"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";

type SequencePreviewNavigatorProps = {
  activeIndex: number;
  totalCount: number;
  activeName: string;
  onPrevious: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
};

export function SequencePreviewNavigator({
  activeIndex,
  totalCount,
  activeName,
  onPrevious,
  onNext,
  onSelectIndex,
}: SequencePreviewNavigatorProps) {
  if (totalCount <= 1) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex items-center justify-between gap-3">
        <IconButton
          type="button"
          label="Previous preview"
          icon={<ChevronLeft aria-hidden className="h-4 w-4" />}
          onClick={onPrevious}
        />
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-bold text-text-primary">
            {activeName}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {activeIndex + 1} of {totalCount}
          </p>
        </div>
        <IconButton
          type="button"
          label="Next preview"
          icon={<ChevronRight aria-hidden className="h-4 w-4" />}
          onClick={onNext}
        />
      </div>
      <div className="mt-3 flex justify-center gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: totalCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Preview ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={[
              "h-2.5 w-2.5 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              index === activeIndex ? "bg-accent" : "bg-slate-300",
            ].join(" ")}
            onClick={() => onSelectIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
