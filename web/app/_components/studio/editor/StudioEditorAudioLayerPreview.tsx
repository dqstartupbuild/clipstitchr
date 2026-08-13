"use client";

import { useEffect, useRef } from "react";
import { getStudioEditorMediaLayerSourceTime } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorMediaLayerSourceTime";
import { getStudioEditorAudioGain } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorAudioGain";
import { getStudioEditorLayerLocalTime } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorLayerLocalTime";
import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";

type StudioEditorAudioLayerPreviewProps = {
  isPlaying: boolean;
  layer: StudioEditorMusicLayer | StudioEditorVoiceLayer;
  sourceUrl: string;
  timelineSeconds: number;
  trackMuted: boolean;
};

export function StudioEditorAudioLayerPreview({
  isPlaying,
  layer,
  sourceUrl,
  timelineSeconds,
  trackMuted,
}: StudioEditorAudioLayerPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sourceTime = getStudioEditorMediaLayerSourceTime(layer, timelineSeconds);
    if (Number.isFinite(audio.duration)) {
      const safeTime = Math.min(Math.max(0, sourceTime), Math.max(0, audio.duration - 0.01));
      if (Math.abs(audio.currentTime - safeTime) > 0.14 || !isPlaying) {
        audio.currentTime = safeTime;
      }
    }
    audio.playbackRate = layer.playbackSpeed;
    audio.muted = trackMuted || layer.audio.muted;
    audio.volume = Math.min(
      1,
      Math.max(
        0,
        getStudioEditorAudioGain(
          layer,
          getStudioEditorLayerLocalTime(layer, timelineSeconds),
        ),
      ),
    );
    if (isPlaying) void audio.play().catch(() => undefined);
    else audio.pause();
  }, [isPlaying, layer, timelineSeconds, trackMuted]);

  return <audio ref={audioRef} preload="auto" src={sourceUrl} />;
}
