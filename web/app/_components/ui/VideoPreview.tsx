"use client";

import { Loader2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type VideoPreviewProps = {
  src: string | null;
  posterSrc?: string | null;
  label: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  isLoading?: boolean;
  trimRange?: VideoTrimRange | null;
  onLoadPreview?: () => void;
};

export function VideoPreview({
  src,
  posterSrc,
  label,
  autoPlay = false,
  controls = true,
  muted = true,
  isLoading = false,
  trimRange = null,
  onLoadPreview,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const trimStart = trimRange?.start;
  const shouldShowVideoControls = controls && (!isPlaying || isHovered);

  useEffect(() => {
    if (!videoRef.current || trimStart === undefined) {
      return;
    }

    videoRef.current.currentTime = trimStart;
  }, [src, trimStart]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) {
      setIsPlaying(false);
      return;
    }

    if (!autoPlay) {
      return;
    }

    const playVideo = async () => {
      try {
        if (trimStart !== undefined) {
          video.currentTime = trimStart;
        }

        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    void playVideo();
  }, [autoPlay, src, trimStart]);

  const keepPlaybackInsideTrim = () => {
    const video = videoRef.current;

    if (!video || !trimRange || video.currentTime < trimRange.end) {
      return;
    }

    video.currentTime = trimRange.start;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && trimRange) {
      videoRef.current.currentTime = trimRange.start;
    }
  };

  const handlePlay = () => {
    const video = videoRef.current;

    if (
      video &&
      trimRange &&
      (video.currentTime < trimRange.start || video.currentTime >= trimRange.end)
    ) {
      video.currentTime = trimRange.start;
    }

    setIsPlaying(true);
  };

  return (
    <div
      className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950"
      onBlur={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {src ? (
        <video
          ref={videoRef}
          key={`${src}:${posterSrc ?? "no-poster"}`}
          aria-label={label}
          autoPlay={autoPlay}
          className="h-full w-full object-contain"
          controls={shouldShowVideoControls}
          loop={!trimRange}
          muted={muted}
          onEnded={keepPlaybackInsideTrim}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={() => setIsPlaying(false)}
          onPlay={handlePlay}
          onTimeUpdate={keepPlaybackInsideTrim}
          playsInline
          poster={posterSrc ?? undefined}
          preload="metadata"
          src={src}
        />
      ) : posterSrc ? (
        onLoadPreview ? (
          <button
            type="button"
            aria-label={
              isLoading ? `Loading preview for ${label}` : `Preview ${label}`
            }
            className="group relative h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterSrc})` }}
            disabled={isLoading}
            onClick={onLoadPreview}
          >
            <span className="absolute inset-0 bg-slate-950/20 transition-colors group-hover:bg-slate-950/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg">
                {isLoading ? (
                  <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
                ) : (
                  <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </span>
            </span>
          </button>
        ) : (
          <div
            aria-label={label}
            role="img"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterSrc})` }}
          />
        )
      ) : onLoadPreview ? (
        <button
          type="button"
          aria-label={`Preview ${label}`}
          className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900"
          disabled={isLoading}
          onClick={onLoadPreview}
        >
          {isLoading ? "Loading preview" : "Preview"}
        </button>
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
          {isLoading ? "Loading preview" : "Preview unavailable"}
        </div>
      )}
    </div>
  );
}
