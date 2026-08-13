"use client";

import { CSSProperties, useEffect, useRef } from "react";
import { getStudioEditorMediaLayerSourceTime } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorMediaLayerSourceTime";
import { getStudioEditorAudioGain } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorAudioGain";
import { getStudioEditorLayerLocalTime } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorLayerLocalTime";
import { getStudioEditorTransitionProgress } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTransitionProgress";
import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";
import type { StudioEditorImageLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorImageLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorVisualLayerPreviewProps = {
  canvas: StudioEditorCanvasV1;
  isPlaying: boolean;
  layer: StudioEditorVideoLayer | StudioEditorImageLayer;
  sourceUrl: string;
  timelineSeconds: number;
  trackMuted: boolean;
};

export function StudioEditorVisualLayerPreview({
  canvas,
  isPlaying,
  layer,
  sourceUrl,
  timelineSeconds,
  trackMuted,
}: StudioEditorVisualLayerPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionProgress = getStudioEditorTransitionProgress(
    layer,
    timelineSeconds,
  );
  const isDip =
    layer.transitionIn.kind === "dipToBlack" ||
    layer.transitionIn.kind === "dipToWhite";
  const layerStyle: CSSProperties = {
    clipPath: `inset(${layer.crop.top * 100}% ${layer.crop.right * 100}% ${layer.crop.bottom * 100}% ${layer.crop.left * 100}%)`,
    opacity: layer.transform.opacity * (isDip ? 1 : transitionProgress),
    transform: `translate(${(layer.transform.positionX / canvas.width) * 100}%, ${(layer.transform.positionY / canvas.height) * 100}%) rotate(${layer.transform.rotationDegrees}deg) scale(${layer.transform.scaleX}, ${layer.transform.scaleY})`,
  };

  useEffect(() => {
    if (layer.kind !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const sourceTime = getStudioEditorMediaLayerSourceTime(
      layer,
      timelineSeconds,
    );
    if (Number.isFinite(video.duration)) {
      const safeTime = Math.min(Math.max(0, sourceTime), Math.max(0, video.duration - 0.01));
      if (Math.abs(video.currentTime - safeTime) > 0.14 || !isPlaying) {
        video.currentTime = safeTime;
      }
    }
    video.playbackRate = layer.playbackSpeed;
    video.muted = trackMuted || layer.audio.muted;
    video.volume = Math.min(
      1,
      Math.max(
        0,
        getStudioEditorAudioGain(
          layer,
          getStudioEditorLayerLocalTime(layer, timelineSeconds),
        ),
      ),
    );

    if (isPlaying) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isPlaying, layer, timelineSeconds, trackMuted]);

  return (
    <div className={styles.previewVisualLayer} style={layerStyle}>
      {layer.kind === "image" ? (
        // The URL is a short-lived, authenticated R2 URL resolved for this owned source.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          draggable={false}
          src={sourceUrl}
          style={isDip ? { opacity: transitionProgress } : undefined}
        />
      ) : (
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          src={sourceUrl}
          style={isDip ? { opacity: transitionProgress } : undefined}
        />
      )}
      {isDip && (
        <span
          className={styles.previewDip}
          style={{
            backgroundColor:
              layer.transitionIn.kind === "dipToBlack" ? "#000" : "#fff",
            opacity: 1 - transitionProgress,
          }}
        />
      )}
    </div>
  );
}
