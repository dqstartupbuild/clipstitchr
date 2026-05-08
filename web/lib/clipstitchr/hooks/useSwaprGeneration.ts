"use client";

import { useCallback, useState } from "react";
import { createReplicateApiRequestHeaders } from "@/lib/clipstitchr/client/createReplicateApiRequestHeaders";
import { createSwaprGenerationPhotoBlob } from "@/lib/clipstitchr/client/createSwaprGenerationPhotoBlob";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import { saveVideoClip } from "@/lib/clipstitchr/storage/saveVideoClip";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";
import { readSwaprPredictionResponse } from "@/lib/clipstitchr/utils/readSwaprPredictionResponse";
import { waitForSwaprPollInterval } from "@/lib/clipstitchr/utils/waitForSwaprPollInterval";

const SWAPR_MODEL_ID = "kwaivgi/kling-v3-motion-control";

type GenerateSwaprVideoOptions = {
  photo: PhotoAsset;
  clip: VideoClip;
  prompt: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
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
      prompt,
      mode,
      characterOrientation,
      keepOriginalSound,
    }: GenerateSwaprVideoOptions) => {
      setStatus("uploading");
      setProgress(0.05);
      setError(null);
      setPredictionId(null);
      setGeneratedClip(null);

      try {
        const referencePhotoBlob = await createSwaprGenerationPhotoBlob(photo);
        const formData = new FormData();
        formData.set(
          "image",
          new File([referencePhotoBlob], photo.originalName, {
            type: referencePhotoBlob.type || "image/jpeg",
          }),
        );
        formData.set(
          "video",
          new File([clip.blob], `${clip.name}.mp4`, { type: clip.mimeType }),
        );
        formData.set("prompt", prompt);
        formData.set("mode", mode);
        formData.set("characterOrientation", characterOrientation);
        formData.set("keepOriginalSound", String(keepOriginalSound));

        const replicateHeaders = createReplicateApiRequestHeaders();
        const createResponse = await fetch("/api/swapr/jobs", {
          method: "POST",
          headers: replicateHeaders,
          body: formData,
        });
        let prediction = await readSwaprPredictionResponse(createResponse);

        setPredictionId(prediction.id);
        setStatus(
          prediction.status === "processing" ? "processing" : "queued",
        );
        setProgress(0.15);

        while (
          prediction.status !== "succeeded" &&
          prediction.status !== "failed" &&
          prediction.status !== "canceled"
        ) {
          await waitForSwaprPollInterval();

          const pollResponse = await fetch(`/api/swapr/jobs/${prediction.id}`, {
            headers: replicateHeaders,
          });
          prediction = await readSwaprPredictionResponse(pollResponse);
          setStatus(
            prediction.status === "processing" ? "processing" : "queued",
          );
          setProgress((currentProgress) => Math.min(0.65, currentProgress + 0.08));
        }

        if (prediction.status !== "succeeded") {
          throw new Error(
            typeof prediction.error === "string"
              ? prediction.error
              : "Replicate did not complete this Swapr job.",
          );
        }

        const outputUrl = getSwaprPredictionOutputUrl(prediction.output);

        if (!outputUrl) {
          throw new Error("Replicate completed but did not return a video URL.");
        }

        setStatus("downloading");
        setProgress(0.72);

        const outputResponse = await fetch(
          `/api/swapr/output?url=${encodeURIComponent(outputUrl)}`,
          { headers: replicateHeaders },
        );

        if (!outputResponse.ok) {
          throw new Error("Unable to download the generated Swapr output.");
        }

        const rawOutputBlob = await outputResponse.blob();
        const outputFile = new File([rawOutputBlob], `${clip.name}-swapr.mp4`, {
          type: rawOutputBlob.type || "video/mp4",
        });

        setStatus("normalizing");
        const normalized = await normalizeUploadedVideo(
          outputFile,
          (nextProgress) => {
            setProgress(0.72 + Math.min(0.2, nextProgress * 0.2));
          },
          { fit: "cover" },
        );
        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(normalized.blob);
        } catch {
          posterBlob = undefined;
        }

        setStatus("saving");
        setProgress(0.96);

        const now = new Date().toISOString();
        const nextClip: VideoClip = {
          id: createId(),
          name: `Swapr - ${photo.name} in ${clip.name}`,
          originalName: outputFile.name,
          clipType: "ugc",
          blob: normalized.blob,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: normalized.mimeType,
          sourceMimeType: rawOutputBlob.type || normalized.metadata.mimeType,
          size: normalized.blob.size,
          originalSize: rawOutputBlob.size,
          width: normalized.metadata.width,
          height: normalized.metadata.height,
          aspectRatio: normalized.metadata.aspectRatio,
          duration: normalized.metadata.duration,
          defaultTrimRange: {
            start: 0,
            end: normalized.metadata.duration,
          },
          hasAudio: normalized.metadata.hasAudio,
          swaprMetadata: {
            source: "swapr",
            sourcePhotoId: photo.id,
            referenceUgcClipId: clip.id,
            replicatePredictionId: prediction.id,
            modelId: SWAPR_MODEL_ID,
            mode,
            characterOrientation,
            prompt: prompt.trim() || undefined,
            keepOriginalSound,
          },
          createdAt: now,
          updatedAt: now,
        };

        await saveVideoClip(nextClip);
        await onClipSaved?.();
        setGeneratedClip(nextClip);
        setStatus("succeeded");
        setProgress(1);
      } catch (nextError) {
        setStatus("failed");
        setProgress(1);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Swapr video.",
        );
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
