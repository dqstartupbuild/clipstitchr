"use client";

import { SlidersHorizontal } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type SelectableClipCardProps = {
  clip: VideoClipMetadata;
  productName?: string;
  cropBounds: VideoCropBounds;
  trimRange: VideoTrimRange;
  isSelected: boolean;
  isSelectionDisabled?: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelect: (id: string) => void;
  onUpdateTrim?: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
  onUpdateCrop?: (
    clip: VideoClipMetadata,
    cropBounds: VideoCropBounds,
  ) => void | Promise<void>;
};

export function SelectableClipCard({
  clip,
  productName,
  cropBounds,
  trimRange,
  isSelected,
  isSelectionDisabled = false,
  onLoadClip,
  onLoadPoster,
  onSelect,
  onUpdateTrim,
  onUpdateCrop,
}: SelectableClipCardProps) {
  const displayDuration = getVideoTrimDisplayDuration(clip.duration, trimRange);

  return (
    <VideoClipPreviewCard
      clip={clip}
      productName={productName}
      displayDuration={displayDuration}
      isSelected={isSelected}
      isSelectionDisabled={isSelectionDisabled}
      onLoadClip={onLoadClip}
      onLoadPoster={onLoadPoster}
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
      cropEditor={
        isSelected && onUpdateCrop
          ? {
              initialCropBounds: cropBounds,
              saveLabel: "Apply crop",
              title: "Stitch crop",
              onSave: (nextCropBounds) => onUpdateCrop(clip, nextCropBounds),
            }
          : undefined
      }
      actions={({ openDetails }) =>
        isSelected && (onUpdateTrim || onUpdateCrop)
          ? [
              {
                label:
                  onUpdateTrim && onUpdateCrop
                    ? "Edit selected trim/crop"
                    : onUpdateCrop
                      ? "Edit selected crop"
                      : "Edit selected trim",
                icon: <SlidersHorizontal aria-hidden className="h-4 w-4" />,
                onClick: () => openDetails({ showControlsEditor: true }),
              },
            ]
          : []
      }
    />
  );
}
