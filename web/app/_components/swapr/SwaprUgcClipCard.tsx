"use client";

import { Check } from "lucide-react";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type SwaprUgcClipCardProps = {
  clip: VideoClip;
  isSelected: boolean;
  onSelect: (clip: VideoClip) => void;
};

export function SwaprUgcClipCard({
  clip,
  isSelected,
  onSelect,
}: SwaprUgcClipCardProps) {
  const videoUrl = useObjectUrl(clip.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);

  return (
    <Panel
      className={[
        "overflow-hidden transition-colors",
        isSelected ? "border-accent ring-2 ring-accent/15" : "",
      ].join(" ")}
    >
      <VideoPreview
        src={videoUrl}
        posterSrc={posterUrl}
        label={clip.name}
        controls={false}
      />
      <div className="p-4">
        <h3 className="truncate text-sm font-bold text-text-primary">
          {clip.name}
        </h3>
        <p className="mt-1 text-xs text-text-tertiary">
          {formatDuration(clip.duration)} . {formatBytes(clip.size)}
        </p>
        <AssetTagList tags={clip.tags} className="mt-3" requiredTag="ugc" />
        <Button
          type="button"
          className="mt-4 w-full"
          variant={isSelected ? "secondary" : "primary"}
          icon={
            isSelected ? <Check aria-hidden className="h-4 w-4" /> : undefined
          }
          onClick={() => onSelect(clip)}
        >
          {isSelected ? "Selected" : "Select Motion"}
        </Button>
      </div>
    </Panel>
  );
}
