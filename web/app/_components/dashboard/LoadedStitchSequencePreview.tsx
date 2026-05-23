"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { TextOverlayPreviewBox } from "@/app/_components/stitchr/TextOverlayPreviewBox";
import { TextOverlayQuickControls } from "@/app/_components/stitchr/TextOverlayQuickControls";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type LoadedStitchSequencePreviewProps = {
  demoClip: VideoClip;
  stitch: Stitch;
  ugcClip: VideoClip;
  onTextOverlayChange?: (textOverlay: TextOverlay) => void;
};

export function LoadedStitchSequencePreview({
  demoClip,
  stitch,
  ugcClip,
  onTextOverlayChange,
}: LoadedStitchSequencePreviewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [areTextControlsOpen, setAreTextControlsOpen] = useState(false);
  const ugcUrl = useObjectUrl(ugcClip.blob);
  const demoUrl = useObjectUrl(demoClip.blob);
  const ugcPosterUrl = useObjectUrl(ugcClip.posterBlob);
  const demoPosterUrl = useObjectUrl(demoClip.posterBlob);
  const ugcTrimStart = stitch.ugcTrimRange?.start;
  const ugcTrimEnd = stitch.ugcTrimRange?.end;
  const demoTrimStart = stitch.demoTrimRange?.start;
  const demoTrimEnd = stitch.demoTrimRange?.end;
  const ugcPlaybackRate = stitch.ugcPlaybackRate ?? 1;
  const demoPlaybackRate = stitch.demoPlaybackRate ?? 1;
  const ugcTrimRange = useMemo(
    () =>
      clampVideoTrimRange(
        {
          start: ugcTrimStart ?? 0,
          end: ugcTrimEnd ?? ugcClip.duration,
        },
        ugcClip.duration,
      ),
    [ugcTrimEnd, ugcTrimStart, ugcClip.duration],
  );
  const demoTrimRange = useMemo(
    () =>
      clampVideoTrimRange(
        {
          start: demoTrimStart ?? 0,
          end: demoTrimEnd ?? demoClip.duration,
        },
        demoClip.duration,
      ),
    [demoClip.duration, demoTrimEnd, demoTrimStart],
  );
  const totalDuration = useMemo(
    () =>
      getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate) +
      getPlaybackRateDuration(demoTrimRange, demoPlaybackRate),
    [demoPlaybackRate, demoTrimRange, ugcPlaybackRate, ugcTrimRange],
  );
  const textOverlay = useMemo(
    () =>
      stitch.textOverlay &&
      (onTextOverlayChange || stitch.textOverlay.text.trim().length > 0)
        ? clampTextOverlay(stitch.textOverlay, totalDuration)
        : null,
    [onTextOverlayChange, stitch.textOverlay, totalDuration],
  );
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
  const shouldShowTextOverlay =
    Boolean(textOverlay) &&
    currentTime >= (textOverlay?.startTime ?? 0) &&
    currentTime <= (textOverlay?.endTime ?? 0);
  const togglePlaybackFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    togglePlayback();
  };

  return (
    <div>
      <div
        ref={stageRef}
        aria-label={isPlaying ? "Pause stitch preview" : "Play stitch preview"}
        className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-950"
        role="button"
        style={{ containerType: "size" }}
        tabIndex={0}
        onClick={togglePlayback}
        onKeyDown={togglePlaybackFromKeyboard}
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
              muted={stitch.includeUgcAudio === false}
              onEnded={() => handleEnded("ugc")}
              onLoadedMetadata={() => handleLoadedMetadata("ugc")}
              onTimeUpdate={() => handleTimeUpdate("ugc")}
              playsInline
              poster={ugcPosterUrl ?? undefined}
              preload="metadata"
              src={ugcUrl}
            />
            <video
              ref={demoVideoRef}
              aria-hidden={activeSegment !== "demo"}
              className={[
                "pointer-events-none absolute inset-0 h-full w-full object-contain",
                activeSegment === "demo" ? "opacity-100" : "opacity-0",
              ].join(" ")}
              muted={stitch.includeDemoAudio === false}
              onEnded={() => handleEnded("demo")}
              onLoadedMetadata={() => handleLoadedMetadata("demo")}
              onTimeUpdate={() => handleTimeUpdate("demo")}
              playsInline
              poster={demoPosterUrl ?? undefined}
              preload="metadata"
              src={demoUrl}
            />
            {textOverlay && shouldShowTextOverlay && onTextOverlayChange ? (
              <TextOverlayBox
                emptyLabel="Text"
                textOverlay={textOverlay}
                stageRef={stageRef}
                totalDuration={totalDuration}
                onChange={onTextOverlayChange}
                onOpenStyleControls={() => setAreTextControlsOpen(true)}
              />
            ) : null}
            {textOverlay && shouldShowTextOverlay && !onTextOverlayChange ? (
              <TextOverlayPreviewBox textOverlay={textOverlay} />
            ) : null}
            {textOverlay &&
            shouldShowTextOverlay &&
            onTextOverlayChange &&
            areTextControlsOpen ? (
              <TextOverlayQuickControls
                textOverlay={textOverlay}
                totalDuration={totalDuration}
                onChange={onTextOverlayChange}
                onClose={() => setAreTextControlsOpen(false)}
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
            Preview unavailable
          </div>
        )}
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
          className="min-w-0 flex-1 accent-accent"
          max={totalDuration}
          min={0}
          step={0.05}
          value={Math.min(currentTime, totalDuration)}
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <p className="w-24 text-right text-xs font-semibold text-text-tertiary">
          {formatDuration(Math.min(currentTime, totalDuration))} /{" "}
          {formatDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}
