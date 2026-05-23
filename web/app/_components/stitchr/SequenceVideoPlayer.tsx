"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { TextOverlayQuickControls } from "@/app/_components/stitchr/TextOverlayQuickControls";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getTextOverlayIsVisible } from "@/lib/clipstitchr/utils/getTextOverlayIsVisible";

type SequenceVideoPlayerProps = {
  ugcClip: VideoClip;
  demoClip: VideoClip;
  demoPlaybackRate: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  textOverlay: TextOverlay | null;
  totalDuration: number;
  ugcPlaybackRate: VideoPlaybackRate;
  onTextOverlayChange: (textOverlay: TextOverlay) => void;
  onPlaybackTimeChange: (currentTime: number) => void;
};

export function SequenceVideoPlayer({
  ugcClip,
  demoClip,
  demoPlaybackRate,
  ugcTrimRange,
  demoTrimRange,
  includeDemoAudio,
  includeUgcAudio,
  textOverlay,
  totalDuration,
  ugcPlaybackRate,
  onTextOverlayChange,
  onPlaybackTimeChange,
}: SequenceVideoPlayerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [areTextControlsOpen, setAreTextControlsOpen] = useState(false);
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
    demoPlaybackRate,
    ugcTrimRange,
    demoTrimRange,
    ugcPlaybackRate,
  });
  const progressValue = Math.min(currentTime, totalDuration);
  const isTextOverlayInRange =
    textOverlay &&
    currentTime >= textOverlay.startTime &&
    currentTime <= textOverlay.endTime;
  const visibleTextOverlay =
    textOverlay &&
    (getTextOverlayIsVisible(textOverlay, currentTime) || isTextOverlayInRange)
      ? textOverlay
      : null;

  useEffect(() => {
    onPlaybackTimeChange(currentTime);
  }, [currentTime, onPlaybackTimeChange]);

  return (
    <div>
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[9/16] w-full max-w-[292px] overflow-hidden rounded-lg bg-slate-950"
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
              muted={!includeUgcAudio}
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
              muted={!includeDemoAudio}
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
        {visibleTextOverlay ? (
          <TextOverlayBox
            emptyLabel="Text"
            textOverlay={visibleTextOverlay}
            stageRef={stageRef}
            totalDuration={totalDuration}
            onChange={onTextOverlayChange}
            onOpenStyleControls={() => setAreTextControlsOpen(true)}
          />
        ) : null}
        {visibleTextOverlay && areTextControlsOpen ? (
          <TextOverlayQuickControls
            textOverlay={visibleTextOverlay}
            totalDuration={totalDuration}
            onChange={onTextOverlayChange}
            onClose={() => setAreTextControlsOpen(false)}
          />
        ) : null}
      </div>
      <div className="mt-3 flex justify-end">
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
      <div className="mt-3 flex items-center gap-3">
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
