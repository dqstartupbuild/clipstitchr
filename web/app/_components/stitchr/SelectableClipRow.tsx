"use client";

import { CheckCircle2, Scissors } from "lucide-react";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type SelectableClipRowProps = {
  clip: VideoClip;
  trimRange: VideoTrimRange;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEditTrim?: (clip: VideoClip) => void;
};

export function SelectableClipRow({
  clip,
  trimRange,
  isSelected,
  onSelect,
  onEditTrim,
}: SelectableClipRowProps) {
  return (
    <div
      className={[
        "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
        isSelected
          ? "border-accent bg-surface-muted"
          : "border-border bg-white hover:border-accent",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onSelect(clip.id)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {clip.name}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {formatDuration(getVideoTrimRangeDuration(trimRange))} selected .{" "}
            {formatDuration(clip.duration)} total
          </p>
          <AssetTagList
            tags={clip.tags}
            className="mt-2"
            maxVisible={3}
            requiredTag={clip.clipType}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={clip.clipType === "ugc" ? "purple" : "green"}>
            {clip.clipType.toUpperCase()}
          </Badge>
          {isSelected ? (
            <CheckCircle2 aria-hidden className="h-5 w-5 text-accent" />
          ) : null}
        </div>
      </button>
      {isSelected && onEditTrim ? (
        <IconButton
          type="button"
          label="Edit selected trim"
          icon={<Scissors aria-hidden className="h-4 w-4" />}
          onClick={() => onEditTrim(clip)}
        />
      ) : null}
    </div>
  );
}
