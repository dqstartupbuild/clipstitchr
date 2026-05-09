"use client";

import { Scissors } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type SelectableClipCardProps = {
  clip: VideoClipMetadata;
  trimRange: VideoTrimRange;
  isSelected: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (id: string) => void;
  onEditTrim?: (clip: VideoClipMetadata) => void;
};

export function SelectableClipCard({
  clip,
  trimRange,
  isSelected,
  onLoadClip,
  onSelect,
  onEditTrim,
}: SelectableClipCardProps) {
  return (
    <VideoClipPreviewCard
      clip={clip}
      isSelected={isSelected}
      onLoadClip={onLoadClip}
      onSelect={() => onSelect(clip.id)}
      footer={() => (
        <div className="flex min-h-9 items-center justify-between gap-3 border-t border-border pt-3">
          <p className="min-w-0 text-xs font-semibold text-text-tertiary">
            {formatDuration(getVideoTrimRangeDuration(trimRange))} trim
          </p>
          {isSelected && onEditTrim ? (
            <IconButton
              type="button"
              label="Edit selected trim"
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              onClick={() => onEditTrim(clip)}
            />
          ) : null}
        </div>
      )}
    />
  );
}
