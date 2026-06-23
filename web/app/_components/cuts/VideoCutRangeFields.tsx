"use client";

import { Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type VideoCutRangeFieldsProps = {
  duration: number;
  index: number;
  value: QuickEditRemoveRange;
  onChange: (range: QuickEditRemoveRange) => void;
  onRemove: () => void;
};

export function VideoCutRangeFields({
  duration,
  index,
  value,
  onChange,
  onRemove,
}: VideoCutRangeFieldsProps) {
  const updateRange = (range: { end: number; start: number }) => {
    const clampedRange = clampVideoTrimRange(range, duration);

    onChange({
      ...value,
      ...clampedRange,
    });
  };

  return (
    <div className="min-w-0 rounded-lg border border-red-100 bg-red-50/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-red-700">
            Selected cut {index + 1}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {formatDuration(value.end - value.start)}
          </p>
        </div>
        <IconButton
          type="button"
          variant="danger"
          label={`Remove cut ${index + 1}`}
          icon={<Trash2 aria-hidden className="h-4 w-4" />}
          onClick={onRemove}
        />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="text-xs font-semibold text-text-tertiary">
            Starts at
          </span>
          <input
            type="number"
            min={0}
            max={duration}
            step={0.1}
            value={value.start}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-white px-2 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
            onChange={(event) =>
              updateRange({
                end: value.end,
                start: Number(event.currentTarget.value),
              })
            }
          />
        </label>
        <label className="block min-w-0">
          <span className="text-xs font-semibold text-text-tertiary">
            Ends at
          </span>
          <input
            type="number"
            min={0}
            max={duration}
            step={0.1}
            value={value.end}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-white px-2 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
            onChange={(event) =>
              updateRange({
                end: Number(event.currentTarget.value),
                start: value.start,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
