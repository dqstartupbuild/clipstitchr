"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/app/_components/ui/Badge";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import { formatDuration } from "@/lib/clipr/utils/formatDuration";

type SelectableClipRowProps = {
  clip: VideoClip;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function SelectableClipRow({
  clip,
  isSelected,
  onSelect,
}: SelectableClipRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(clip.id)}
      className={[
        "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        isSelected
          ? "border-accent bg-surface-muted"
          : "border-border bg-white hover:border-accent",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text-primary">{clip.name}</p>
        <p className="mt-1 text-xs text-text-tertiary">
          {formatDuration(clip.duration)}
        </p>
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
  );
}
