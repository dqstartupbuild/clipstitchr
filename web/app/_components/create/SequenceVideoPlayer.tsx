"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/app/_components/ui/Button";
import { TextOverlayBox } from "@/app/_components/create/TextOverlayBox";
import { useObjectUrl } from "@/lib/clipr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipr/hooks/useSequenceVideoPlayer";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";

type SequenceVideoPlayerProps = {
  ugcClip: VideoClip;
  demoClip: VideoClip;
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  textOverlay: TextOverlay | null;
  totalDuration: number;
  onTextOverlayChange: (textOverlay: TextOverlay) => void;
  onPlaybackTimeChange: (currentTime: number) => void;
};

export function SequenceVideoPlayer({
  ugcClip,
  demoClip,
  ugcTrimRange,
  demoTrimRange,
  textOverlay,
  totalDuration,
  onTextOverlayChange,
  onPlaybackTimeChange,
}: SequenceVideoPlayerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ugcUrl = useObjectUrl(ugcClip.blob);
  const demoUrl = useObjectUrl(demoClip.blob);
  const ugcPosterUrl = useObjectUrl(ugcClip.posterBlob);
  const demoPosterUrl = useObjectUrl(demoClip.posterBlob);
  const {
    activeSegment,
    currentTime,
    handleEnded,
    handleLoadedMetadata,
    handleSeeking,
    handleTimeUpdate,
    restart,
    videoRef,
  } = useSequenceVideoPlayer({
    ugcTrimRange,
    demoTrimRange,
  });
  const activeUrl = activeSegment === "ugc" ? ugcUrl : demoUrl;
  const activePosterUrl =
    activeSegment === "ugc" ? ugcPosterUrl : demoPosterUrl;
  const activeName = activeSegment === "ugc" ? ugcClip.name : demoClip.name;

  useEffect(() => {
    onPlaybackTimeChange(currentTime);
  }, [currentTime, onPlaybackTimeChange]);

  return (
    <div>
      <div
        ref={stageRef}
        className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-950"
        style={{ containerType: "size" }}
      >
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
            onLoadedMetadata={handleLoadedMetadata}
            onSeeking={handleSeeking}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Preview unavailable
          </div>
        )}
        {textOverlay ? (
          <TextOverlayBox
            textOverlay={textOverlay}
            stageRef={stageRef}
            totalDuration={totalDuration}
            onChange={onTextOverlayChange}
          />
        ) : null}
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
