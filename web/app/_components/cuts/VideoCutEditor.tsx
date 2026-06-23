"use client";

import { Plus, Scissors } from "lucide-react";
import { useId, useState } from "react";
import { VideoCutRangeFields } from "@/app/_components/cuts/VideoCutRangeFields";
import { Button } from "@/app/_components/ui/Button";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getNextManualCutRange } from "@/lib/clipstitchr/utils/getNextManualCutRange";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type VideoCutEditorProps = {
  duration: number;
  saveLabel?: string;
  showActions?: boolean;
  title: string;
  trimRange: {
    end: number;
    start: number;
  };
  value: QuickEditRemoveRange[];
  onCancel?: () => void;
  onChange: (removeRanges: QuickEditRemoveRange[]) => void;
  onSave?: (removeRanges: QuickEditRemoveRange[]) => void | Promise<void>;
};

export function VideoCutEditor({
  duration,
  saveLabel = "Save cuts",
  showActions = true,
  title,
  trimRange,
  value,
  onCancel,
  onChange,
  onSave,
}: VideoCutEditorProps) {
  const editorId = useId();
  const [isSaving, setIsSaving] = useState(false);
  const normalizedRanges = normalizeQuickEditRemoveRanges(value, duration);
  const editedDuration = getQuickEditPlaybackDuration(
    trimRange,
    duration,
    normalizedRanges,
  );
  const nextCutRange = getNextManualCutRange(normalizedRanges, duration);

  const updateCut = (index: number, range: QuickEditRemoveRange) => {
    onChange(
      normalizeQuickEditRemoveRanges(
        normalizedRanges.map((currentRange, currentIndex) =>
          currentIndex === index ? range : currentRange,
        ),
        duration,
      ),
    );
  };

  const removeCut = (index: number) => {
    onChange(normalizedRanges.filter((_, currentIndex) => currentIndex !== index));
  };

  const addCut = () => {
    if (!nextCutRange) {
      return;
    }

    onChange(
      normalizeQuickEditRemoveRanges(
        [
          ...normalizedRanges,
          {
            ...nextCutRange,
            reason: "Cut by hand",
          },
        ],
        duration,
      ),
    );
  };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(normalizedRanges);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
            {title}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {normalizedRanges.length
              ? `${normalizedRanges.length} cut${normalizedRanges.length === 1 ? "" : "s"} . ${formatDuration(editedDuration)} left`
              : "No cuts yet"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Plus aria-hidden className="h-4 w-4" />}
          disabled={!nextCutRange}
          onClick={addCut}
        >
          Add cut
        </Button>
      </div>
      <div className="mt-3 grid gap-3">
        {normalizedRanges.length ? (
          normalizedRanges.map((range, index) => (
            <VideoCutRangeFields
              key={`${range.start}:${range.end}:${index}`}
              duration={duration}
              id={`${editorId}-${index}`}
              index={index}
              value={range}
              onChange={(nextRange) => updateCut(index, nextRange)}
              onRemove={() => removeCut(index)}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
            Add the slow parts you want this video to skip.
          </div>
        )}
      </div>
      {showActions ? (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="subtle" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            icon={<Scissors aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            onClick={handleSave}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
