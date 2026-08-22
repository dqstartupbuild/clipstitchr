"use client";

import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import { getQuickEditCropTransform } from "@/lib/clipstitchr/utils/getQuickEditCropTransform";

type StitchrSequenceVideoLayerProps = {
  clip: VideoClip;
  isActive: boolean;
  isMuted: boolean;
  playbackRate: VideoPlaybackRate;
  quickEdit?: QuickEditSuggestions;
  videoRef: (video: HTMLVideoElement | null) => void;
  onEnded: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
};

export function StitchrSequenceVideoLayer({
  clip,
  isActive,
  isMuted,
  playbackRate,
  quickEdit,
  videoRef,
  onEnded,
  onLoadedMetadata,
  onTimeUpdate,
}: StitchrSequenceVideoLayerProps) {
  const videoUrl = useObjectUrl(clip.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);
  const cropTransform = getQuickEditCropTransform(quickEdit?.crop);

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
      style={{ transform: cropTransform, transformOrigin: "center" }}
    />
  );
}
