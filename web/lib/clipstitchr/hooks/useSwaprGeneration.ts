"use client";

import { useCallback, useState } from "react";
import { createSwaprGeneration } from "@/lib/clipstitchr/client/createSwaprGeneration";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createId } from "@/lib/clipstitchr/utils/createId";

type GenerateSwaprVideoOptions = {
  photo: PhotoAssetMetadata;
  clip: VideoClipMetadata;
  referenceVideoSegments: SwaprReferenceVideoSegment[];
  prompt: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
  generationSpeedTier?: GenerationSpeedTier;
  keepOriginalSound: boolean;
};

export function useSwaprGeneration(onClipSaved?: () => void | Promise<void>) {
  const [status, setStatus] = useState<SwaprGenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [generatedClip, setGeneratedClip] = useState<VideoClip | null>(null);

  const generate = useCallback(
    async ({
      photo,
      clip,
      referenceVideoSegments,
      prompt,
      mode,
      characterOrientation,
      generationSpeedTier,
      keepOriginalSound,
    }: GenerateSwaprVideoOptions) => {
      setStatus("uploading");
      setProgress(0.05);
      setError(null);
      setPredictionId(null);
      setGeneratedClip(null);

      try {
        if (!referenceVideoSegments.length) {
          throw new Error("Choose a source video before starting Swapr.");
        }

        const batchId = createId();
        const clipId = createId();
        const totalEstimatedDurationSeconds = referenceVideoSegments.reduce(
          (totalDuration, segment) => totalDuration + segment.duration,
          0,
        );

        const job = await createSwaprGeneration({
          batchId,
          characterOrientation,
          clipId,
          clipName: `Swapr - ${photo.name} in ${clip.name}`,
          generationSpeedTier,
          keepOriginalSound,
          mode,
          photoId: photo.id,
          prompt,
          referenceClipId: clip.id,
          referenceClipName: clip.name,
          segments: referenceVideoSegments,
          totalEstimatedDurationSeconds,
        });

        setPredictionId(job?.id ?? null);
        await onClipSaved?.();
        setStatus("succeeded");
        setProgress(1);
        return true;
      } catch (nextError) {
        setStatus("failed");
        setProgress(1);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Swapr video.",
        );
        return false;
      }
    },
    [onClipSaved],
  );

  return {
    status,
    progress,
    error,
    predictionId,
    generatedClip,
    isGenerating:
      status !== "idle" && status !== "succeeded" && status !== "failed",
    generate,
  };
}
