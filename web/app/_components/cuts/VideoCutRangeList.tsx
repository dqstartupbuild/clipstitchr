"use client";

import { Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type VideoCutRangeListProps = {
  selectedIndex: number | null;
  value: QuickEditRemoveRange[];
  onRemove: (index: number) => void;
  onSelect: (index: number) => void;
};

export function VideoCutRangeList({
  selectedIndex,
  value,
  onRemove,
  onSelect,
}: VideoCutRangeListProps) {
  if (!value.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-slate-50 p-3 text-sm font-semibold text-text-tertiary">
        No cuts yet
      </div>
    );
  }

  return (
    <div className="grid max-h-48 min-w-0 gap-2 overflow-y-auto pr-1">
      {value.map((range, index) => {
        const isSelected = selectedIndex === index;

        return (
          <div
            key={`${range.start}:${range.end}:${index}`}
            className={[
              "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2",
              isSelected
                ? "border-accent bg-purple-50"
                : "border-border bg-white",
            ].join(" ")}
          >
            <button
              type="button"
              className="min-w-0 text-left"
              onClick={() => onSelect(index)}
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Cut {index + 1}
              </span>
              <span className="mt-1 block truncate text-sm font-semibold tabular-nums text-text-primary">
                {formatDuration(range.start)} - {formatDuration(range.end)}
              </span>
            </button>
            <IconButton
              type="button"
              variant="danger"
              label={`Remove cut ${index + 1}`}
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => onRemove(index)}
            />
          </div>
        );
      })}
    </div>
  );
}
