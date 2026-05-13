"use client";

import { SlidersHorizontal } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
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
      actions={({ openDetails }) =>
        isSelected && onUpdateTrim
          ? [
              {
                label: "Edit selected trim",
                icon: <SlidersHorizontal aria-hidden className="h-4 w-4" />,
                onClick: () => openDetails({ showControlsEditor: true }),
              },
            ]
          : []
      }
    />
  );
}
