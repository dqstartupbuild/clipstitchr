"use client";

import { Check } from "lucide-react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import { Button } from "@/app/_components/ui/Button";
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
      footer={() => (
        <Button
          type="button"
          className="w-full"
          variant={isSelected ? "secondary" : "primary"}
          icon={
            isSelected ? <Check aria-hidden className="h-4 w-4" /> : undefined
          }
          onClick={() => onSelect(clip)}
        >
          {isSelected ? "Selected" : "Select Motion"}
        </Button>
      )}
    />
  );
}
