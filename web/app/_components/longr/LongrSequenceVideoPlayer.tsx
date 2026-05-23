"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { LongrSequenceVideoLayer } from "@/app/_components/longr/LongrSequenceVideoLayer";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useLongrSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrSequenceVideoPlayerProps = {
  clips: VideoClip[];
  playbackRates: VideoPlaybackRate[];
  trimRanges: VideoTrimRange[];
};

export function LongrSequenceVideoPlayer({
  clips,
  playbackRates,
  trimRanges,
}: LongrSequenceVideoPlayerProps) {
  const {
    activeIndex,
    currentTime,
    handleEnded,
    handleLoadedMetadata,
    handleTimeUpdate,
    isPlaying,
    restart,
    seekTo,
    setVideoRef,
    togglePlayback,
    totalDuration,
  } = useLongrSequenceVideoPlayer({ playbackRates, trimRanges });
  const progressValue = Math.min(currentTime, totalDuration);

  return (
    <div className="p-4">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-lg bg-slate-950">
        {clips.length ? (
          clips.map((clip, index) => (
            <LongrSequenceVideoLayer
              key={clip.id}
              clip={clip}
              isActive={activeIndex === index}
              playbackRate={playbackRates[index] ?? 1}
              videoRef={(video) => setVideoRef(index, video)}
              onEnded={() => handleEnded(index)}
              onLoadedMetadata={() => handleLoadedMetadata(index)}
              onTimeUpdate={() => handleTimeUpdate(index)}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Preview unavailable
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <div className="flex items-center gap-2">
          <IconButton
            type="button"
            label={isPlaying ? "Pause Long preview" : "Play Long preview"}
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
            label="Replay Long preview"
            icon={<RotateCcw aria-hidden className="h-4 w-4" />}
            onClick={restart}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          aria-label="Long preview time"
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
