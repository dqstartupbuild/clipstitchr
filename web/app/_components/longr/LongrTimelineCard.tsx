"use client";

import { GripVertical, X } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type LongrTimelineCardProps = {
  clip: VideoClipMetadata;
  index: number;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
  onRemove: (id: string) => void;
};

export function LongrTimelineCard({
  clip,
  index,
  isDragging,
  onDragStart,
  onDrop,
  onRemove,
}: LongrTimelineCardProps) {
  const posterUrl = useObjectUrl(clip.posterBlob);

  return (
    <div
      draggable
      className={[
        "grid w-[132px] shrink-0 grid-cols-[24px_minmax(0,1fr)_36px] items-center gap-1 rounded-lg border bg-white p-2 shadow-sm",
        isDragging ? "border-accent opacity-70" : "border-border",
      ].join(" ")}
      onDragStart={() => onDragStart(clip.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(clip.id)}
    >
      <GripVertical aria-hidden className="h-4 w-4 text-text-tertiary" />
      <div className="min-w-0">
        <div
          aria-label={clip.name}
          role="img"
          className="mx-auto aspect-[9/16] w-10 rounded bg-slate-950 bg-cover bg-center"
          style={
            posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined
          }
        />
        <p className="mt-1 truncate text-center text-[11px] font-bold text-text-primary">
          {index + 1}. {clip.name}
        </p>
      </div>
      <IconButton
        label="Remove from timeline"
        icon={<X aria-hidden className="h-3.5 w-3.5" />}
        onClick={() => onRemove(clip.id)}
      />
    </div>
  );
}
