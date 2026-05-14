"use client";

import { Check, Plus } from "lucide-react";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type LongrClipLibraryCardProps = {
  clip: VideoClipMetadata;
  productName?: string;
  disabled: boolean;
  isSelected: boolean;
  onAdd: (clip: VideoClipMetadata) => void;
  onRemove: (clip: VideoClipMetadata) => void;
};

export function LongrClipLibraryCard({
  clip,
  productName,
  disabled,
  isSelected,
  onAdd,
  onRemove,
}: LongrClipLibraryCardProps) {
  const posterUrl = useObjectUrl(clip.posterBlob);
  const duration = getVideoTrimRangeDuration(getDefaultVideoTrimRange(clip));

  return (
    <div className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-white p-2">
      <div
        aria-label={clip.name}
        role="img"
        className="aspect-[9/16] w-[54px] rounded-md bg-slate-950 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-text-primary">
            {clip.name}
          </h3>
          <Badge>{clip.clipType.toUpperCase()}</Badge>
        </div>
        <p className="mt-1 text-xs font-semibold text-text-tertiary">
          {[productName, formatDuration(duration)].filter(Boolean).join(" . ")}
        </p>
      </div>
      <IconButton
        label={isSelected ? "Remove from Longr" : "Add to Longr"}
        disabled={!isSelected && disabled}
        icon={
          isSelected ? (
            <Check aria-hidden className="h-4 w-4" />
          ) : (
            <Plus aria-hidden className="h-4 w-4" />
          )
        }
        onClick={() => (isSelected ? onRemove(clip) : onAdd(clip))}
      />
    </div>
  );
}
