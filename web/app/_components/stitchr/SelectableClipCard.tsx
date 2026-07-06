"use client";

import { SlidersHorizontal } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { getQuickEditReviewRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditReviewRemoveRanges";
import { getVideoClipPlaybackDuration } from "@/lib/clipstitchr/utils/getVideoClipPlaybackDuration";

type SelectableClipCardProps = {
  clip: VideoClipMetadata;
  productName?: string;
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
  onUpdateCuts?: (
    clip: VideoClipMetadata,
    removeRanges: QuickEditRemoveRange[],
  ) => void | Promise<void>;
};

export function SelectableClipCard({
  clip,
  productName,
  trimRange,
  isSelected,
  isSelectionDisabled = false,
  onLoadClip,
  onLoadPoster,
  onSelect,
  onUpdateCuts,
  onUpdateTrim,
}: SelectableClipCardProps) {
  const displayDuration = getVideoClipPlaybackDuration(clip, trimRange);
  const quickEdit = createQuickEditSuggestionsFromMetadata(clip.quickEdit);
  const reviewRemoveRanges = getQuickEditReviewRemoveRanges(
    clip.performanceScore?.quickEditSuggestions,
  );
  const hasReviewableAiCuts =
    !quickEdit?.removeRanges.length && reviewRemoveRanges.length > 0;
  const controlsLabel = hasReviewableAiCuts
    ? "Review AI cuts"
    : onUpdateTrim && onUpdateCuts
      ? "Edit trim and cuts"
      : onUpdateCuts
        ? "Edit cuts"
        : "Edit selected trim";

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
      cutEditor={
        isSelected && onUpdateCuts
          ? {
              initialRemoveRanges: quickEdit?.removeRanges ?? reviewRemoveRanges,
              onSave: (removeRanges) => onUpdateCuts(clip, removeRanges),
            }
          : undefined
      }
      actions={({ openDetails }) =>
        isSelected && (onUpdateTrim || onUpdateCuts)
          ? [
              {
                label: controlsLabel,
                icon: <SlidersHorizontal aria-hidden className="h-4 w-4" />,
                onClick: () => openDetails({ showControlsEditor: true }),
              },
            ]
          : []
      }
    />
  );
}
