"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { useObjectUrl } from "@/lib/clipr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipr/hooks/useSequenceVideoPlayer";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type SequenceVideoPlayerProps = {
  ugcClip: VideoClip;
  demoClip: VideoClip;
};

export function SequenceVideoPlayer({
  ugcClip,
  demoClip,
}: SequenceVideoPlayerProps) {
  const ugcUrl = useObjectUrl(ugcClip.blob);
  const demoUrl = useObjectUrl(demoClip.blob);
  const ugcPosterUrl = useObjectUrl(ugcClip.posterBlob);
  const demoPosterUrl = useObjectUrl(demoClip.posterBlob);
  const { activeSegment, handleEnded, restart, videoRef } =
    useSequenceVideoPlayer();
  const activeUrl = activeSegment === "ugc" ? ugcUrl : demoUrl;
  const activePosterUrl =
    activeSegment === "ugc" ? ugcPosterUrl : demoPosterUrl;
  const activeName = activeSegment === "ugc" ? ugcClip.name : demoClip.name;

  return (
    <div>
      <div className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950">
        {activeUrl ? (
          <video
            key={`${activeUrl}:${activePosterUrl ?? "no-poster"}`}
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            playsInline
            poster={activePosterUrl ?? undefined}
            preload="metadata"
            src={activeUrl}
            onEnded={handleEnded}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Preview unavailable
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{activeName}</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Playing {activeSegment.toUpperCase()}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<RotateCcw aria-hidden className="h-4 w-4" />}
          onClick={restart}
        >
          Restart
        </Button>
      </div>
    </div>
  );
}
