"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { TextOverlayPreviewBox } from "@/app/_components/stitchr/TextOverlayPreviewBox";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useSequenceVideoPlayer";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type LoadedStitchSequencePreviewProps = {
  demoClip: VideoClip;
  stitch: Stitch;
  ugcClip: VideoClip;
};

export function LoadedStitchSequencePreview({
  demoClip,
  stitch,
  ugcClip,
}: LoadedStitchSequencePreviewProps) {
  const ugcUrl = useObjectUrl(ugcClip.blob);
  const demoUrl = useObjectUrl(demoClip.blob);
  const ugcPosterUrl = useObjectUrl(ugcClip.posterBlob);
  const demoPosterUrl = useObjectUrl(demoClip.posterBlob);
  const ugcTrimRange = clampVideoTrimRange(
    stitch.ugcTrimRange ?? {
      start: 0,
      end: ugcClip.duration,
    },
    ugcClip.duration,
  );
  const demoTrimRange = clampVideoTrimRange(
    stitch.demoTrimRange ?? {
      start: 0,
      end: demoClip.duration,
    },
    demoClip.duration,
  );
  const totalDuration =
    getVideoTrimRangeDuration(ugcTrimRange) +
    getVideoTrimRangeDuration(demoTrimRange);
  const textOverlay =
    stitch.textOverlay && stitch.textOverlay.text.trim().length > 0
      ? clampTextOverlay(stitch.textOverlay, totalDuration)
      : null;
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
  const shouldShowTextOverlay =
    Boolean(textOverlay) &&
    currentTime >= (textOverlay?.startTime ?? 0) &&
    currentTime <= (textOverlay?.endTime ?? 0);

  useEffect(() => {
    if (!ugcUrl || !demoUrl) {
      return;
    }

    restart();
  }, [demoUrl, restart, ugcUrl]);

  return (
    <div>
      <div
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
              muted={stitch.includeUgcAudio === false}
              onEnded={() => handleEnded("ugc")}
              onLoadedMetadata={() => handleLoadedMetadata("ugc")}
              onTimeUpdate={() => handleTimeUpdate("ugc")}
              playsInline
              poster={ugcPosterUrl ?? undefined}
              preload="auto"
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
              preload="auto"
              src={demoUrl}
            />
            {textOverlay && shouldShowTextOverlay ? (
              <TextOverlayPreviewBox textOverlay={textOverlay} />
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
