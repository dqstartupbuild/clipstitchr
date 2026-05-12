"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createSwaprGenerationPhotoBlob } from "@/lib/clipstitchr/client/createSwaprGenerationPhotoBlob";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import { stitchNormalizedVideoClips } from "@/lib/clipstitchr/media/stitchNormalizedVideoClips";
import { trimNormalizedVideo } from "@/lib/clipstitchr/media/trimNormalizedVideo";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createSwaprReferenceSegments } from "@/lib/clipstitchr/utils/createSwaprReferenceSegments";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";
import { readSwaprPredictionResponse } from "@/lib/clipstitchr/utils/readSwaprPredictionResponse";
import { waitForSwaprPollInterval } from "@/lib/clipstitchr/utils/waitForSwaprPollInterval";

const SWAPR_MODEL_ID = "kwaivgi/kling-v3-motion-control";

type GenerateSwaprVideoOptions = {
  photo: PhotoAsset;
  clip: VideoClip;
  prompt: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
  generationSpeedTier?: GenerationSpeedTier;
  keepOriginalSound: boolean;
};

type CreateSwaprPredictionOptions = {
  characterOrientation: SwaprCharacterOrientation;
  clipName: string;
  estimatedSeconds: number;
  generationSpeedTier?: GenerationSpeedTier;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  onPredictionStatus?: (
    predictionId: string,
    status: "queued" | "processing",
  ) => void;
  onOutputDownloadStart?: () => void;
  photo: PhotoAsset;
  prompt: string;
  referencePhotoBlob: Blob;
  referenceVideoBlob: Blob;
};

type CompletedSwaprPrediction = {
  characterOrientation: SwaprCharacterOrientation;
  mode: SwaprMode;
  outputBlob: Blob;
  predictionId: string;
};

function getSaveVideoClipArgs(clip: VideoClip) {
  return {
    id: clip.id,
    name: clip.name,
    tags: clip.tags ?? [],
    originalName: clip.originalName,
    clipType: clip.clipType,
    videoObject: clip.videoObject,
    posterObject: clip.posterObject,
    posterVersion: clip.posterVersion,
    mimeType: clip.mimeType,
    sourceMimeType: clip.sourceMimeType,
    size: clip.size,
    originalSize: clip.originalSize,
    width: clip.width,
    height: clip.height,
    aspectRatio: clip.aspectRatio,
    duration: clip.duration,
    defaultTrimRange: clip.defaultTrimRange,
    hasAudio: clip.hasAudio,
    swaprMetadata: clip.swaprMetadata,
    createdAt: clip.createdAt,
    updatedAt: clip.updatedAt,
  };
}

async function createCompletedSwaprPrediction({
  characterOrientation,
  clipName,
  estimatedSeconds,
  generationSpeedTier,
  keepOriginalSound,
  mode,
  onPredictionStatus,
  onOutputDownloadStart,
  photo,
  prompt,
  referencePhotoBlob,
  referenceVideoBlob,
}: CreateSwaprPredictionOptions): Promise<CompletedSwaprPrediction> {
  const formData = new FormData();
  formData.set(
    "image",
    new File([referencePhotoBlob], photo.originalName, {
      type: referencePhotoBlob.type || "image/jpeg",
    }),
  );
  formData.set(
    "video",
    new File([referenceVideoBlob], `${clipName}.mp4`, {
      type: referenceVideoBlob.type || "video/mp4",
    }),
  );
  formData.set("prompt", prompt);
  formData.set("mode", mode);
  formData.set("characterOrientation", characterOrientation);
  formData.set("estimatedSeconds", String(Math.max(1, estimatedSeconds)));
  if (generationSpeedTier) {
    formData.set("generationSpeedTier", generationSpeedTier);
  }
  formData.set("keepOriginalSound", String(keepOriginalSound));

  const createResponse = await fetch("/api/swapr/jobs", {
    method: "POST",
    body: formData,
  });
  let prediction = await readSwaprPredictionResponse(createResponse);
  const effectiveMode = prediction.mode ?? mode;
  const effectiveCharacterOrientation =
    prediction.characterOrientation ?? characterOrientation;

  onPredictionStatus?.(
    prediction.id,
    prediction.status === "processing" ? "processing" : "queued",
  );

  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    prediction.status !== "aborted"
  ) {
    await waitForSwaprPollInterval();

    const pollResponse = await fetch(`/api/swapr/jobs/${prediction.id}`);
    prediction = await readSwaprPredictionResponse(pollResponse);
    onPredictionStatus?.(
      prediction.id,
      prediction.status === "processing" ? "processing" : "queued",
    );
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

  onOutputDownloadStart?.();

  const outputResponse = await fetch(
    `/api/swapr/output?id=${encodeURIComponent(prediction.id)}&url=${encodeURIComponent(outputUrl)}`,
  );

  if (!outputResponse.ok) {
    throw new Error("Unable to download the generated Swapr output.");
  }

  return {
    characterOrientation: effectiveCharacterOrientation,
    mode: effectiveMode,
    outputBlob: await outputResponse.blob(),
    predictionId: prediction.id,
  };
}

export function useSwaprGeneration(onClipSaved?: () => void | Promise<void>) {
  const saveVideoClip = useMutation(api.videoClips.save);
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
      generationSpeedTier,
      keepOriginalSound,
    }: GenerateSwaprVideoOptions) => {
      setStatus("uploading");
      setProgress(0.05);
      setError(null);
      setPredictionId(null);
      setGeneratedClip(null);

      try {
        const referenceSegments = createSwaprReferenceSegments(clip.duration);

        if (!referenceSegments.length) {
          throw new Error("Choose a source clip with a valid duration.");
        }

        const referencePhotoBlob = await createSwaprGenerationPhotoBlob(photo);
        const segmentClips: VideoClip[] = [];
        const predictionIds: string[] = [];
        let effectiveMode = mode;
        let effectiveCharacterOrientation = characterOrientation;

        for (const [segmentIndex, segmentRange] of referenceSegments.entries()) {
          const isSegmented = referenceSegments.length > 1;
          const segmentProgressBase =
            0.05 + (segmentIndex / referenceSegments.length) * 0.78;
          const segmentProgressSpan = 0.78 / referenceSegments.length;
          let referenceVideoBlob = clip.blob;
          let estimatedSeconds = getVideoTrimRangeDuration(segmentRange);

          if (isSegmented) {
            setStatus("splitting");
            const trimmedSegment = await trimNormalizedVideo({
              blob: clip.blob,
              trimRange: segmentRange,
              onProgress: (nextProgress) =>
                setProgress(
                  segmentProgressBase +
                    nextProgress * segmentProgressSpan * 0.12,
                ),
            });
            referenceVideoBlob = trimmedSegment.blob;
            estimatedSeconds = trimmedSegment.metadata.duration;
          }

          setStatus("uploading");
          setProgress(segmentProgressBase + segmentProgressSpan * 0.14);

          const prediction = await createCompletedSwaprPrediction({
            characterOrientation,
            clipName:
              isSegmented ? `${clip.name}-part-${segmentIndex + 1}` : clip.name,
            estimatedSeconds,
            generationSpeedTier,
            keepOriginalSound,
            mode,
            onOutputDownloadStart: () => {
              setStatus("downloading");
              setProgress(segmentProgressBase + segmentProgressSpan * 0.68);
            },
            onPredictionStatus: (nextPredictionId, nextStatus) => {
              setPredictionId(nextPredictionId);
              setStatus(nextStatus);
              setProgress((currentProgress) =>
                Math.min(
                  segmentProgressBase + segmentProgressSpan * 0.66,
                  Math.max(
                    currentProgress,
                    segmentProgressBase + segmentProgressSpan * 0.22,
                  ) +
                    segmentProgressSpan * 0.04,
                ),
              );
            },
            photo,
            prompt,
            referencePhotoBlob,
            referenceVideoBlob,
          });
          effectiveMode = prediction.mode;
          effectiveCharacterOrientation = prediction.characterOrientation;
          predictionIds.push(prediction.predictionId);
          setPredictionId(prediction.predictionId);

          const outputFile = new File(
            [prediction.outputBlob],
            `${clip.name}-swapr-part-${segmentIndex + 1}.mp4`,
            {
              type: prediction.outputBlob.type || "video/mp4",
            },
          );

          setStatus("normalizing");
          const normalized = await normalizeUploadedVideo(
            outputFile,
            (nextProgress) => {
              setProgress(
                segmentProgressBase +
                  segmentProgressSpan * (0.7 + nextProgress * 0.16),
              );
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
          setProgress(segmentProgressBase + segmentProgressSpan * 0.9);

          const now = new Date().toISOString();
          const clipId = createId();
          const [videoObject, posterObject] = await uploadBlobsToR2([
            {
              blob: normalized.blob,
              kind: "video-clip-video",
              recordId: clipId,
            },
            ...(posterBlob
              ? [
                  {
                    blob: posterBlob,
                    kind: "video-clip-poster" as const,
                    recordId: clipId,
                  },
                ]
              : []),
          ]);
          const segmentClip: VideoClip = {
            id: clipId,
            name: isSegmented
              ? `Swapr - ${photo.name} in ${clip.name} ` +
                `(${segmentIndex + 1}/${referenceSegments.length})`
              : `Swapr - ${photo.name} in ${clip.name}`,
            originalName: outputFile.name,
            clipType: "ugc",
            videoObject,
            blob: normalized.blob,
            posterObject,
            posterBlob,
            posterVersion: posterBlob
              ? VIDEO_POSTER_CAPTURE_VERSION
              : undefined,
            mimeType: normalized.mimeType,
            sourceMimeType:
              prediction.outputBlob.type || normalized.metadata.mimeType,
            size: normalized.blob.size,
            originalSize: prediction.outputBlob.size,
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
              replicatePredictionId: prediction.predictionId,
              replicatePredictionIds: [prediction.predictionId],
              modelId: SWAPR_MODEL_ID,
              mode: effectiveMode,
              characterOrientation: effectiveCharacterOrientation,
              prompt: prompt.trim() || undefined,
              keepOriginalSound,
              ...(isSegmented
                ? {
                    sourceSegmentIndex: segmentIndex,
                    sourceSegmentCount: referenceSegments.length,
                    sourceSegmentStartSeconds: segmentRange.start,
                    sourceSegmentEndSeconds: segmentRange.end,
                  }
                : {}),
            },
            createdAt: now,
            updatedAt: now,
          };

          await saveVideoClip(getSaveVideoClipArgs(segmentClip));
          await onClipSaved?.();
          segmentClips.push(segmentClip);
          setGeneratedClip(segmentClip);
          setProgress(segmentProgressBase + segmentProgressSpan);
        }

        if (segmentClips.length === 1) {
          setStatus("succeeded");
          setProgress(1);
          return;
        }

        setStatus("stitching");
        const stitched = await stitchNormalizedVideoClips(
          segmentClips,
          (nextProgress) => setProgress(0.84 + nextProgress * 0.1),
        );
        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(stitched.blob);
        } catch {
          posterBlob = undefined;
        }

        const firstPredictionId = predictionIds[0];

        if (!firstPredictionId) {
          throw new Error("No completed Swapr segment predictions were found.");
        }

        setStatus("saving");
        setProgress(0.96);

        const now = new Date().toISOString();
        const clipId = createId();
        const [videoObject, posterObject] = await uploadBlobsToR2([
          {
            blob: stitched.blob,
            kind: "video-clip-video",
            recordId: clipId,
          },
          ...(posterBlob
            ? [
                {
                  blob: posterBlob,
                  kind: "video-clip-poster" as const,
                  recordId: clipId,
                },
              ]
            : []),
        ]);
        const stitchedClip: VideoClip = {
          id: clipId,
          name: `Swapr - ${photo.name} in ${clip.name}`,
          originalName: `${clip.name}-swapr.mp4`,
          clipType: "ugc",
          videoObject,
          blob: stitched.blob,
          posterObject,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: stitched.mimeType,
          sourceMimeType: stitched.mimeType,
          size: stitched.blob.size,
          originalSize: stitched.blob.size,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          aspectRatio: TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT,
          duration: stitched.duration,
          defaultTrimRange: {
            start: 0,
            end: stitched.duration,
          },
          hasAudio: stitched.hasAudio,
          swaprMetadata: {
            source: "swapr",
            sourcePhotoId: photo.id,
            referenceUgcClipId: clip.id,
            replicatePredictionId: firstPredictionId,
            replicatePredictionIds: predictionIds,
            modelId: SWAPR_MODEL_ID,
            mode: effectiveMode,
            characterOrientation: effectiveCharacterOrientation,
            prompt: prompt.trim() || undefined,
            keepOriginalSound,
            sourceSegmentCount: segmentClips.length,
            segmentClipIds: segmentClips.map((segmentClip) => segmentClip.id),
          },
          createdAt: now,
          updatedAt: now,
        };

        await saveVideoClip(getSaveVideoClipArgs(stitchedClip));
        await onClipSaved?.();
        setGeneratedClip(stitchedClip);
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
    [onClipSaved, saveVideoClip],
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
