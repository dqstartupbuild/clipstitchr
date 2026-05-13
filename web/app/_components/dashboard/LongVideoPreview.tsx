"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongVideoPreviewProps = {
  duration: number;
  label: string;
  posterSrc?: string | null;
  src: string | null;
};

export function LongVideoPreview({
  duration,
  label,
  posterSrc,
  src,
}: LongVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadataDuration, setMetadataDuration] = useState(duration);
  const totalDuration = metadataDuration || duration;
  const progressValue = Math.min(currentTime, totalDuration);

  const play = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.currentTime >= totalDuration) {
      video.currentTime = 0;
      setCurrentTime(0);
    }

    void video.play().catch(() => {
      setIsPlaying(false);
    });
  };
  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };
  const togglePlayback = () => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  };
  const restart = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    setCurrentTime(0);
    play();
  };
  const seekTo = (time: number) => {
    const video = videoRef.current;
    const nextTime = Math.max(0, Math.min(time, totalDuration));

    setCurrentTime(nextTime);

    if (video) {
      video.currentTime = nextTime;
    }
  };

  return (
    <div className="p-3">
      <div className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-lg bg-slate-950">
        {src ? (
          <video
            ref={videoRef}
            aria-label={label}
            className="h-full w-full object-contain"
            playsInline
            poster={posterSrc ?? undefined}
            preload="metadata"
            src={src}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(totalDuration);
            }}
            onLoadedMetadata={() => {
              const nextDuration = videoRef.current?.duration;

              if (nextDuration && Number.isFinite(nextDuration)) {
                setMetadataDuration(nextDuration);
              }
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
          />
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
            label={isPlaying ? "Pause Long" : "Play Long"}
            icon={
              isPlaying ? (
                <Pause aria-hidden className="h-4 w-4" />
              ) : (
                <Play aria-hidden className="h-4 w-4" />
              )
            }
            disabled={!src}
            onClick={togglePlayback}
          />
          <IconButton
            type="button"
            label="Replay Long"
            icon={<RotateCcw aria-hidden className="h-4 w-4" />}
            disabled={!src}
            onClick={restart}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          aria-label="Long playback time"
          min={0}
          max={totalDuration}
          step={0.05}
          value={progressValue}
          className="min-w-0 flex-1 accent-accent"
          disabled={!src}
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <p className="w-24 text-right text-xs font-semibold text-text-tertiary">
          {formatDuration(progressValue)} / {formatDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}
