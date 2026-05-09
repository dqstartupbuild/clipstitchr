"use client";

import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type SwaprUgcClipCardProps = {
  clip: VideoClipMetadata;
  isSelected: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (clip: VideoClipMetadata) => void;
};

export function SwaprUgcClipCard({
  clip,
  isSelected,
  onLoadClip,
  onSelect,
}: SwaprUgcClipCardProps) {
  return (
    <VideoClipPreviewCard
      clip={clip}
      isSelected={isSelected}
      onLoadClip={onLoadClip}
      onSelect={() => onSelect(clip)}
    />
  );
}
