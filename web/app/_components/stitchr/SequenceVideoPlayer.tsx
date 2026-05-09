"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

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
    demoVideoRef,
    handleEnded,
    handleLoadedMetadata,
    handleTimeUpdate,
    isPlaying,
    restart,
    seekTo,
    togglePlayback,
    ugcVideoRef,
  } = useSequenceVideoPlayer({
    ugcTrimRange,
    demoTrimRange,
  });
  const activeName = activeSegment === "ugc" ? ugcClip.name : demoClip.name;
  const progressValue = Math.min(currentTime, totalDuration);

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
        {ugcUrl && demoUrl ? (
          <>
            <video
              ref={ugcVideoRef}
              aria-hidden={activeSegment !== "ugc"}
              className={[
                "pointer-events-none absolute inset-0 h-full w-full object-contain",
                activeSegment === "ugc" ? "opacity-100" : "opacity-0",
              ].join(" ")}
              playsInline
              poster={ugcPosterUrl ?? undefined}
              preload="auto"
              src={ugcUrl}
              onEnded={() => handleEnded("ugc")}
              onLoadedMetadata={() => handleLoadedMetadata("ugc")}
              onTimeUpdate={() => handleTimeUpdate("ugc")}
            />
            <video
              ref={demoVideoRef}
              aria-hidden={activeSegment !== "demo"}
              className={[
                "pointer-events-none absolute inset-0 h-full w-full object-contain",
                activeSegment === "demo" ? "opacity-100" : "opacity-0",
              ].join(" ")}
              playsInline
              poster={demoPosterUrl ?? undefined}
              preload="auto"
              src={demoUrl}
              onEnded={() => handleEnded("demo")}
              onLoadedMetadata={() => handleLoadedMetadata("demo")}
              onTimeUpdate={() => handleTimeUpdate("demo")}
            />
          </>
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
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">{activeName}</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Playing {activeSegment.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            type="button"
            label={isPlaying ? "Pause preview" : "Play preview"}
            icon={
              isPlaying ? (
                <Pause aria-hidden className="h-4 w-4" />
              ) : (
                <Play aria-hidden className="h-4 w-4" />
              )
            }
            onClick={togglePlayback}
          />
          <IconButton
            type="button"
            label="Restart preview"
            icon={<RotateCcw aria-hidden className="h-4 w-4" />}
            onClick={restart}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="range"
          aria-label="Preview time"
          min={0}
          max={totalDuration}
          step={0.05}
          value={progressValue}
          className="min-w-0 flex-1 accent-accent"
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <p className="w-24 text-right text-xs font-semibold text-text-tertiary">
          {formatDuration(progressValue)} / {formatDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}
