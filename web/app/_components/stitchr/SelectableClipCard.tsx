"use client";

import { SlidersHorizontal } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type SelectableClipCardProps = {
  clip: VideoClipMetadata;
  trimRange: VideoTrimRange;
  isSelected: boolean;
  isSelectionDisabled?: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (id: string) => void;
  onUpdateTrim?: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
};

export function SelectableClipCard({
  clip,
  trimRange,
  isSelected,
  isSelectionDisabled = false,
  onLoadClip,
  onSelect,
  onUpdateTrim,
}: SelectableClipCardProps) {
  const displayDuration = getVideoTrimDisplayDuration(clip.duration, trimRange);

  return (
    <VideoClipPreviewCard
      clip={clip}
      displayDuration={displayDuration}
      isSelected={isSelected}
      isSelectionDisabled={isSelectionDisabled}
      onLoadClip={onLoadClip}
      onSelect={() => onSelect(clip.id)}
      trimEditor={
        isSelected && onUpdateTrim
          ? {
              initialTrimRange: trimRange,
              saveLabel: "Apply trim",
              title: "Stitch trim",
              onSave: (nextTrimRange) => onUpdateTrim(clip, nextTrimRange),
            }
          : undefined
      }
      footer={({ openDetails }) =>
        isSelected && onUpdateTrim ? (
          <div className="flex min-h-9 items-center justify-end border-t border-border pt-3">
            <IconButton
              type="button"
              label="Edit selected trim"
              icon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
              onClick={() => openDetails({ showTrimEditor: true })}
            />
          </div>
        ) : null
      }
    />
  );
}
