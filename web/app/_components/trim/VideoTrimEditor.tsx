"use client";

import { Save } from "lucide-react";
import { useId, useState } from "react";
import { VideoTrimRangeSlider } from "@/app/_components/trim/VideoTrimRangeSlider";
import { Button } from "@/app/_components/ui/Button";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type VideoTrimEditorProps = {
  duration: number;
  title: string;
  saveLabel: string;
  showActions?: boolean;
  value: VideoTrimRange;
  onCancel: () => void;
  onChange: (trimRange: VideoTrimRange) => void;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

export function VideoTrimEditor({
  duration,
  title,
  saveLabel,
  showActions = true,
  value,
  onCancel,
  onChange,
  onSave,
}: VideoTrimEditorProps) {
  const sliderId = useId();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave(clampVideoTrimRange(value, duration));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          {title}
        </p>
      </div>
      <div className="mt-3">
        <VideoTrimRangeSlider
          id={sliderId}
          duration={duration}
          value={value}
          onChange={onChange}
        />
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-text-tertiary">
        <span>Start {formatDuration(value.start)}</span>
        <span>End {formatDuration(value.end)}</span>
      </div>
      {showActions ? (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="subtle" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            icon={<Save aria-hidden className="h-4 w-4" />}
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
