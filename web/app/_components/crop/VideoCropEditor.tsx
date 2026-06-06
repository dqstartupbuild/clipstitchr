"use client";

import { Save } from "lucide-react";
import { useId, useState } from "react";
import { VIDEO_CROP_MAX_EDGE_INSET } from "@/lib/clipstitchr/constants/videoCropBounds";
import { Button } from "@/app/_components/ui/Button";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { clampVideoCropBounds } from "@/lib/clipstitchr/utils/clampVideoCropBounds";

type VideoCropEditorProps = {
  saveLabel: string;
  showActions?: boolean;
  title: string;
  value: VideoCropBounds;
  onCancel: () => void;
  onChange: (cropBounds: VideoCropBounds) => void;
  onSave: (cropBounds: VideoCropBounds) => void | Promise<void>;
};

const cropEdges = [
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
] as const;

function formatCropPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function VideoCropEditor({
  saveLabel,
  showActions = true,
  title,
  value,
  onCancel,
  onChange,
  onSave,
}: VideoCropEditorProps) {
  const id = useId();
  const [isSaving, setIsSaving] = useState(false);
  const clampedValue = clampVideoCropBounds(value);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave(clampedValue);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          {title}
        </p>
      </div>
      <div className="mt-3 grid gap-3">
        {cropEdges.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="flex items-center justify-between gap-3 text-xs font-semibold text-text-tertiary">
              <span>{label}</span>
              <span>{formatCropPercent(clampedValue[key])}</span>
            </span>
            <input
              id={`${id}-${key}`}
              type="range"
              min={0}
              max={VIDEO_CROP_MAX_EDGE_INSET}
              step={0.01}
              value={clampedValue[key]}
              className="mt-1 w-full accent-accent"
              onChange={(event) =>
                onChange(
                  clampVideoCropBounds({
                    ...clampedValue,
                    [key]: Number(event.currentTarget.value),
                  }),
                )
              }
            />
          </label>
        ))}
      </div>
      {showActions ? (
        <div className="mt-3 flex justify-end gap-2">
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
