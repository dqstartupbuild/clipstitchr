"use client";

import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLIPR_MUSIC_AD_GAIN } from "@/lib/clipstitchr/constants/cliprMusicMix";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { getCliprMusicGain } from "@/lib/clipstitchr/media/getCliprMusicGain";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getNextQuickEditSourceTime } from "@/lib/clipstitchr/utils/getNextQuickEditSourceTime";
import { getQuickEditCropTransform } from "@/lib/clipstitchr/utils/getQuickEditCropTransform";
import { getQuickEditPlaybackTimeForSourceTime } from "@/lib/clipstitchr/utils/getQuickEditPlaybackTimeForSourceTime";

type VideoClipMusicPreviewSeekRequest = {
  id: number;
  seconds: number;
};

type VideoClipMusicPreviewProps = {
  src: string | null;
  posterSrc?: string | null;
  label: string;
  autoPlay?: boolean;
  controls?: boolean;
  hasSourceAudio: boolean;
  isLoading?: boolean;
  musicBlob: Blob | null;
  musicEnabled: boolean;
  musicVolume: number;
  quickEdit?: QuickEditSuggestions | null;
  seekRequest?: VideoClipMusicPreviewSeekRequest | null;
  sourceDuration?: number;
  trimRange?: VideoTrimRange | null;
  onLoadPreview?: () => void;
  onSourceTimeChange?: (sourceTime: number) => void;
};

export function VideoClipMusicPreview({
  src,
  posterSrc,
  label,
  autoPlay = false,
  controls = true,
  hasSourceAudio,
  isLoading = false,
  musicBlob,
  musicEnabled,
  musicVolume,
  quickEdit = null,
  seekRequest = null,
  sourceDuration,
  trimRange = null,
  onLoadPreview,
  onSourceTimeChange,
}: VideoClipMusicPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicUrl = useObjectUrl(musicBlob);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const shouldPlayMusic = Boolean(musicEnabled && musicUrl);
  const musicGain = shouldPlayMusic
    ? getCliprMusicGain({ hasSourceAudio, volume: musicVolume })
    : 0;
  const shouldShowVideoControls = controls && (!isPlaying || isHovered);
  const trimStart = trimRange?.start;
  const trimEnd = trimRange?.end;
  const safeSourceDuration = sourceDuration ?? trimRange?.end ?? 0;
  const cropTransform = getQuickEditCropTransform(quickEdit?.crop);

  const syncMusicToVideo = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !shouldPlayMusic) {
      return;
    }

    const sequenceTime = trimRange
      ? getQuickEditPlaybackTimeForSourceTime(
          video.currentTime,
          trimRange,
          safeSourceDuration,
          quickEdit?.removeRanges,
        )
      : Math.max(0, video.currentTime);
    const audioDuration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : 0;
    const targetTime = audioDuration
      ? sequenceTime % audioDuration
      : sequenceTime;

    if (
      Number.isFinite(targetTime) &&
      Math.abs(audio.currentTime - targetTime) > 0.15
    ) {
      audio.currentTime = targetTime;
    }
  }, [quickEdit?.removeRanges, safeSourceDuration, shouldPlayMusic, trimRange]);

  const pauseMusic = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const playMusic = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !shouldPlayMusic) {
      pauseMusic();
      return;
    }

    syncMusicToVideo();
    audio.volume = musicGain;
    audio.muted = false;
    void audio.play().catch(() => null);
  }, [musicGain, pauseMusic, shouldPlayMusic, syncMusicToVideo]);

  const emitSourceTimeChange = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    onSourceTimeChange?.(video.currentTime);
  }, [onSourceTimeChange]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.volume = CLIPR_MUSIC_AD_GAIN;
      video.muted = !shouldPlayMusic;
    }

    if (audio) {
      audio.volume = musicGain;
      audio.muted = !shouldPlayMusic;
    }

    if (!isPlaying) {
      pauseMusic();
      return;
    }

    if (shouldPlayMusic) {
      playMusic();
      return;
    }

    pauseMusic();
  }, [isPlaying, musicGain, pauseMusic, playMusic, shouldPlayMusic]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || trimStart === undefined) {
      return;
    }

    video.currentTime = trimRange
      ? getNextQuickEditSourceTime(
          trimStart,
          trimRange,
          safeSourceDuration,
          quickEdit?.removeRanges,
        )
      : trimStart;
    syncMusicToVideo();
    emitSourceTimeChange();
  }, [
    emitSourceTimeChange,
    quickEdit?.removeRanges,
    safeSourceDuration,
    src,
    syncMusicToVideo,
    trimRange,
    trimStart,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !seekRequest) {
      return;
    }

    video.currentTime = clamp(
      seekRequest.seconds,
      trimStart ?? 0,
      trimEnd ?? safeSourceDuration,
    );
    syncMusicToVideo();
    emitSourceTimeChange();
  }, [
    emitSourceTimeChange,
    safeSourceDuration,
    seekRequest,
    syncMusicToVideo,
    trimEnd,
    trimStart,
  ]);

  const keepPlaybackInsideTrim = () => {
    const video = videoRef.current;

    if (!video || !trimRange) {
      return;
    }

    const nextSourceTime = getNextQuickEditSourceTime(
      video.currentTime,
      trimRange,
      safeSourceDuration,
      quickEdit?.removeRanges,
    );

    if (
      nextSourceTime > video.currentTime + 0.01 &&
      nextSourceTime < trimRange.end
    ) {
      video.currentTime = nextSourceTime;
      syncMusicToVideo();
      return;
    }

    if (video.currentTime < trimRange.end) {
      return;
    }

    video.currentTime = trimRange.start;
    syncMusicToVideo();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && trimRange) {
      videoRef.current.currentTime = getNextQuickEditSourceTime(
        trimRange.start,
        trimRange,
        safeSourceDuration,
        quickEdit?.removeRanges,
      );
    }

    syncMusicToVideo();
    emitSourceTimeChange();
  };

  const handlePlay = () => {
    const video = videoRef.current;

    if (
      video &&
      trimRange &&
      (video.currentTime < trimRange.start || video.currentTime >= trimRange.end)
    ) {
      video.currentTime = getNextQuickEditSourceTime(
        trimRange.start,
        trimRange,
        safeSourceDuration,
        quickEdit?.removeRanges,
      );
    }

    setIsPlaying(true);
    playMusic();
    emitSourceTimeChange();
  };

  const handlePause = () => {
    setIsPlaying(false);
    pauseMusic();
  };

  const handleTimeUpdate = () => {
    keepPlaybackInsideTrim();
    syncMusicToVideo();
    emitSourceTimeChange();
  };

  const handleSeeked = () => {
    syncMusicToVideo();
    emitSourceTimeChange();
  };

  return (
    <div
      className="video-clip-preview-frame aspect-[9/16] min-w-0 max-w-full overflow-hidden rounded-lg bg-slate-950"
      onBlur={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {src ? (
        <>
          <video
            ref={videoRef}
            key={`${src}:${posterSrc ?? "no-poster"}`}
            aria-label={label}
            autoPlay={autoPlay}
            className={[
              "h-full w-full",
              cropTransform ? "object-cover" : "object-contain",
            ].join(" ")}
            controls={shouldShowVideoControls}
            loop={!trimRange}
            muted={!shouldPlayMusic}
            onEnded={keepPlaybackInsideTrim}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={handlePause}
            onPlay={handlePlay}
            onSeeked={handleSeeked}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            poster={posterSrc ?? undefined}
            preload="metadata"
            src={src}
            style={
              cropTransform
                ? {
                    transform: cropTransform,
                    transformOrigin: "center",
                  }
                : undefined
            }
          />
          {musicUrl ? (
            <audio
              ref={audioRef}
              key={musicUrl}
              loop
              muted={!shouldPlayMusic}
              preload="auto"
              src={musicUrl}
            />
          ) : null}
        </>
      ) : posterSrc ? (
        onLoadPreview ? (
          <button
            type="button"
            aria-label={`Preview ${label}`}
            className="group relative h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterSrc})` }}
            disabled={isLoading}
            onClick={onLoadPreview}
          >
            <span className="absolute inset-0 bg-slate-950/20 transition-colors group-hover:bg-slate-950/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg">
                <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
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
