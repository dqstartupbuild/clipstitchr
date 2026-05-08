"use client";

import { Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type VideoTrimDialogProps = {
  clip: VideoClip;
  initialTrimRange: VideoTrimRange;
  title: string;
  onClose: () => void;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

export function VideoTrimDialog({
  clip,
  initialTrimRange,
  title,
  onClose,
  onSave,
}: VideoTrimDialogProps) {
  const isMountedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoUrl = useObjectUrl(clip.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);
  const [trimRange, setTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [isSaving, setIsSaving] = useState(false);
  const selectedDuration = getVideoTrimRangeDuration(trimRange);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.currentTime = trimRange.start;
  }, [trimRange.start]);

  const updateStart = (start: number) => {
    setTrimRange((currentTrimRange) =>
      clampVideoTrimRange(
        {
          ...currentTrimRange,
          start,
        },
        clip.duration,
      ),
    );
  };

  const updateEnd = (end: number) => {
    setTrimRange((currentTrimRange) =>
      clampVideoTrimRange(
        {
          ...currentTrimRange,
          end,
        },
        clip.duration,
      ),
    );
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || video.currentTime < trimRange.end) {
      return;
    }

    video.pause();
    video.currentTime = trimRange.end;
  };

  const handlePlay = () => {
    const video = videoRef.current;

    if (
      !video ||
      (video.currentTime >= trimRange.start && video.currentTime < trimRange.end)
    ) {
      return;
    }

    video.currentTime = trimRange.start;
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave(clampVideoTrimRange(trimRange, clip.duration));
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-trim-dialog-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">{title}</p>
            <h2
              id="video-trim-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close trim editor"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,260px)_1fr]">
          <div className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950">
            {videoUrl ? (
              <video
                ref={videoRef}
                className="h-full w-full object-contain"
                controls
                playsInline
                poster={posterUrl ?? undefined}
                preload="metadata"
                src={videoUrl}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = trimRange.start;
                  }
                }}
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                Preview unavailable
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-text-tertiary">Start</p>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {formatDuration(trimRange.start)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary">End</p>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {formatDuration(trimRange.end)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-tertiary">
                  Selected
                </p>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {formatDuration(selectedDuration)}
                </p>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                Start time
              </span>
              <input
                type="range"
                min={0}
                max={clip.duration}
                step={0.1}
                value={trimRange.start}
                className="mt-3 w-full accent-accent"
                onChange={(event) => updateStart(Number(event.target.value))}
              />
              <input
                type="number"
                min={0}
                max={clip.duration}
                step={0.1}
                value={trimRange.start.toFixed(1)}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
                onChange={(event) => updateStart(Number(event.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                End time
              </span>
              <input
                type="range"
                min={0}
                max={clip.duration}
                step={0.1}
                value={trimRange.end}
                className="mt-3 w-full accent-accent"
                onChange={(event) => updateEnd(Number(event.target.value))}
              />
              <input
                type="number"
                min={0}
                max={clip.duration}
                step={0.1}
                value={trimRange.end.toFixed(1)}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
                onChange={(event) => updateEnd(Number(event.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border p-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save trim
          </Button>
        </div>
      </div>
    </div>
  );
}
