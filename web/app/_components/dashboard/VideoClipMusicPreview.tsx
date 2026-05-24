"use client";

import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { TextOverlayQuickControls } from "@/app/_components/stitchr/TextOverlayQuickControls";
import { CLIPR_MUSIC_AD_GAIN } from "@/lib/clipstitchr/constants/cliprMusicMix";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { getCliprMusicGain } from "@/lib/clipstitchr/media/getCliprMusicGain";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getTextOverlayIsVisible } from "@/lib/clipstitchr/utils/getTextOverlayIsVisible";

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
  textOverlay?: TextOverlay | null;
  trimRange?: VideoTrimRange | null;
  totalDuration?: number;
  onTextOverlayChange?: (textOverlay: TextOverlay) => void;
  onPlaybackTimeChange?: (currentTime: number) => void;
  onLoadPreview?: () => void;
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
  textOverlay = null,
  trimRange = null,
  totalDuration = trimRange?.end ?? 0,
  onTextOverlayChange,
  onPlaybackTimeChange,
  onLoadPreview,
}: VideoClipMusicPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const musicUrl = useObjectUrl(musicBlob);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(trimRange?.start ?? 0);
  const [areTextControlsOpen, setAreTextControlsOpen] = useState(false);
  const shouldPlayMusic = Boolean(musicEnabled && musicUrl);
  const musicGain = shouldPlayMusic
    ? getCliprMusicGain({ hasSourceAudio, volume: musicVolume })
    : 0;
  const shouldShowVideoControls = controls && (!isPlaying || isHovered);
  const trimStart = trimRange?.start;

  const syncMusicToVideo = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !shouldPlayMusic) {
      return;
    }

    const sequenceTime = trimRange
      ? Math.max(0, video.currentTime - trimRange.start)
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
  }, [shouldPlayMusic, trimRange]);

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

    video.currentTime = trimStart;
    syncMusicToVideo();
  }, [src, syncMusicToVideo, trimStart]);

  const keepPlaybackInsideTrim = () => {
    const video = videoRef.current;

    if (!video || !trimRange || video.currentTime < trimRange.end) {
      return;
    }

    video.currentTime = trimRange.start;
    syncMusicToVideo();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && trimRange) {
      videoRef.current.currentTime = trimRange.start;
      setCurrentTime(trimRange.start);
    }

    syncMusicToVideo();
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
    playMusic();
  };

  const handlePause = () => {
    setIsPlaying(false);
    pauseMusic();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (video) {
      setCurrentTime(video.currentTime);
      onPlaybackTimeChange?.(video.currentTime);
    }

    keepPlaybackInsideTrim();
    syncMusicToVideo();
  };
  const visibleTextOverlay =
    textOverlay && getTextOverlayIsVisible(textOverlay, currentTime)
      ? textOverlay
      : null;

  return (
    <div
      ref={stageRef}
      className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-950"
      style={{ containerType: "size" }}
      onBlur={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {src ? (
        <>
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              key={`${src}:${posterSrc ?? "no-poster"}`}
              aria-label={label}
              autoPlay={autoPlay}
              className="h-full w-full object-contain"
              controls={shouldShowVideoControls}
              loop={!trimRange}
              muted={!shouldPlayMusic}
              onEnded={keepPlaybackInsideTrim}
              onLoadedMetadata={handleLoadedMetadata}
              onPause={handlePause}
              onPlay={handlePlay}
              onSeeked={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  onPlaybackTimeChange?.(videoRef.current.currentTime);
                }

                syncMusicToVideo();
              }}
              onTimeUpdate={handleTimeUpdate}
              playsInline
              poster={posterSrc ?? undefined}
              preload="metadata"
              src={src}
            />
            {visibleTextOverlay && onTextOverlayChange ? (
              <TextOverlayBox
                emptyLabel="Text"
                textOverlay={visibleTextOverlay}
                stageRef={stageRef}
                totalDuration={totalDuration}
                onChange={onTextOverlayChange}
                onOpenStyleControls={() => setAreTextControlsOpen(true)}
              />
            ) : null}
            {visibleTextOverlay && areTextControlsOpen && onTextOverlayChange ? (
              <TextOverlayQuickControls
                textOverlay={visibleTextOverlay}
                totalDuration={totalDuration}
                onChange={onTextOverlayChange}
                onClose={() => setAreTextControlsOpen(false)}
              />
            ) : null}
          </div>
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
