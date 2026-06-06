"use client";

import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import { getVideoCropPreviewStyle } from "@/lib/clipstitchr/utils/getVideoCropPreviewStyle";

type StitchrSequenceVideoLayerProps = {
  clip: VideoClip;
  cropBounds?: VideoCropBounds | null;
  isActive: boolean;
  isMuted: boolean;
  playbackRate: VideoPlaybackRate;
  videoRef: (video: HTMLVideoElement | null) => void;
  onEnded: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
};

export function StitchrSequenceVideoLayer({
  clip,
  cropBounds = null,
  isActive,
  isMuted,
  playbackRate,
  videoRef,
  onEnded,
  onLoadedMetadata,
  onTimeUpdate,
}: StitchrSequenceVideoLayerProps) {
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
        "pointer-events-none max-w-none",
        isActive ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={getVideoCropPreviewStyle(cropBounds)}
      muted={isMuted}
      onCanPlay={(event) => {
        event.currentTarget.playbackRate = playbackRate;
      }}
      onEnded={onEnded}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      playsInline
      poster={posterUrl ?? undefined}
      preload="auto"
      src={videoUrl}
    />
  );
}
