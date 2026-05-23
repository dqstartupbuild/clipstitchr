"use client";

import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type SwaprSourceClipCardProps = {
  clip: VideoClipMetadata;
  isSelected: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster: (id: string) => Promise<Blob | null>;
  onSelect: (clip: VideoClipMetadata) => void;
};

export function SwaprSourceClipCard({
  clip,
  isSelected,
  onLoadClip,
  onLoadPoster,
  onSelect,
}: SwaprSourceClipCardProps) {
  return (
    <VideoClipPreviewCard
      clip={clip}
      isSelected={isSelected}
      onLoadClip={onLoadClip}
      onLoadPoster={onLoadPoster}
      onSelect={() => onSelect(clip)}
    />
  );
}
