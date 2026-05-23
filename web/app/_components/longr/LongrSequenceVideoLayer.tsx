"use client";

import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";

type LongrSequenceVideoLayerProps = {
  clip: VideoClip;
  isActive: boolean;
  playbackRate: VideoPlaybackRate;
  videoRef: (video: HTMLVideoElement | null) => void;
  onEnded: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
};

export function LongrSequenceVideoLayer({
  clip,
  isActive,
  playbackRate,
  videoRef,
  onEnded,
  onLoadedMetadata,
  onTimeUpdate,
}: LongrSequenceVideoLayerProps) {
  const videoUrl = useObjectUrl(clip.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);

  if (!videoUrl) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      aria-hidden={!isActive}
      className={[
        "pointer-events-none absolute inset-0 h-full w-full object-contain",
        isActive ? "opacity-100" : "opacity-0",
      ].join(" ")}
      playsInline
      poster={posterUrl ?? undefined}
      preload="auto"
      src={videoUrl}
      onCanPlay={(event) => {
        event.currentTarget.playbackRate = playbackRate;
      }}
      onEnded={onEnded}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
    />
  );
}
