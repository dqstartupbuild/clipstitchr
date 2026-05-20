"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createSwaprPrediction } from "@/lib/clipstitchr/client/createSwaprPrediction";
import { downloadSwaprPredictionOutputBlob } from "@/lib/clipstitchr/client/downloadSwaprPredictionOutputBlob";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { waitForSwaprPrediction } from "@/lib/clipstitchr/client/waitForSwaprPrediction";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import { stitchLongrSequence } from "@/lib/clipstitchr/media/stitchLongrSequence";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createId } from "@/lib/clipstitchr/utils/createId";

const SWAPR_MODEL_ID = "kwaivgi/kling-v3-motion-control";

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

type NormalizedSwaprSegment = {
  clip: VideoClip;
  rawMimeType: string;
  rawSize: number;
};

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
        const totalEstimatedDurationSeconds = referenceVideoSegments.reduce(
          (totalDuration, segment) => totalDuration + segment.duration,
          0,
        );
        const predictions: SwaprPredictionResponse[] = [];

        for (let index = 0; index < referenceVideoSegments.length; index += 1) {
          predictions.push(
            await createSwaprPrediction({
              batchId,
              characterOrientation,
              generationSpeedTier,
              keepOriginalSound,
              mode,
              photoId: photo.id,
              prompt,
              segmentIndex: index,
              segment: referenceVideoSegments[index],
              totalEstimatedDurationSeconds,
              totalSegmentCount: referenceVideoSegments.length,
            }),
          );
          setProgress(0.05 + ((index + 1) / referenceVideoSegments.length) * 0.1);
        }

        const effectiveMode = predictions[0]?.mode ?? mode;
        const effectiveCharacterOrientation =
          predictions[0]?.characterOrientation ?? characterOrientation;

        setPredictionId(predictions[0]?.id ?? null);
        setStatus(
          predictions.some((prediction) => prediction.status === "processing")
            ? "processing"
            : "queued",
        );
        setProgress(0.15);

        let completedCount = 0;
        const completedPredictions = await Promise.all(
          predictions.map(async (prediction) => {
            const completedPrediction = await waitForSwaprPrediction({
              prediction,
              onStatusChange: (nextPrediction) =>
                setStatus(
                  nextPrediction.status === "processing"
                    ? "processing"
                    : "queued",
                ),
            });

            completedCount += 1;
            setProgress(
              0.15 + (completedCount / referenceVideoSegments.length) * 0.5,
            );

            return completedPrediction;
          }),
        );
        setStatus("downloading");
        setProgress(0.65);

        const rawOutputBlobs: Blob[] = [];

        for (let index = 0; index < completedPredictions.length; index += 1) {
          rawOutputBlobs.push(
            await downloadSwaprPredictionOutputBlob(completedPredictions[index]),
          );
          setProgress(0.65 + ((index + 1) / completedPredictions.length) * 0.07);
        }

        setStatus("normalizing");
        const normalizedSegments: NormalizedSwaprSegment[] = [];

        for (let index = 0; index < rawOutputBlobs.length; index += 1) {
          const rawOutputBlob = rawOutputBlobs[index];
          const outputFile = new File(
            [rawOutputBlob],
            `${clip.name}-swapr-${index + 1}.mp4`,
            {
              type: rawOutputBlob.type || "video/mp4",
            },
          );
          const normalized = await normalizeUploadedVideo(
            outputFile,
            (nextProgress) => {
              setProgress(
                0.72 +
                  ((index + Math.min(1, nextProgress)) / rawOutputBlobs.length) *
                    0.15,
              );
            },
            { fit: "cover" },
          );
          const segmentClipId = createId();

          normalizedSegments.push({
            rawMimeType: rawOutputBlob.type || normalized.metadata.mimeType,
            rawSize: rawOutputBlob.size,
            clip: {
              id: segmentClipId,
              name: `${clip.name} Swapr segment ${index + 1}`,
              originalName: outputFile.name,
              clipType: "ugc",
              videoObject: {
                key: `swapr/generated-segments/${segmentClipId}`,
                contentType: normalized.mimeType,
                size: normalized.blob.size,
              },
              blob: normalized.blob,
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
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        }

        let finalBlob = normalizedSegments[0].clip.blob;
        let finalMimeType = normalizedSegments[0].clip.mimeType;
        let finalDuration = normalizedSegments[0].clip.duration;
        let finalHasAudio = normalizedSegments[0].clip.hasAudio;

        if (normalizedSegments.length > 1) {
          setStatus("stitching");

          const stitched = await stitchLongrSequence(
            normalizedSegments.map(({ clip: segmentClip }) => ({
              clip: segmentClip,
              trimRange: {
                start: 0,
                end: segmentClip.duration,
              },
            })),
            {
              onProgress: (nextProgress) =>
                setProgress(0.87 + Math.min(1, nextProgress) * 0.08),
            },
          );

          finalBlob = stitched.blob;
          finalMimeType = stitched.mimeType;
          finalDuration = stitched.duration;
          finalHasAudio = normalizedSegments.some(
            ({ clip: segmentClip }) => segmentClip.hasAudio,
          );
        }

        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(finalBlob);
        } catch {
          posterBlob = undefined;
        }

        setStatus("saving");
        setProgress(0.96);

        const now = new Date().toISOString();
        const clipId = createId();
        const [videoObject, posterObject] = await uploadBlobsToR2([
          {
            blob: finalBlob,
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
        const nextClip: VideoClip = {
          id: clipId,
          name: `Swapr - ${photo.name} in ${clip.name}`,
          originalName: `${clip.name}-swapr.mp4`,
          clipType: "ugc",
          videoObject,
          blob: finalBlob,
          posterObject,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: finalMimeType,
          sourceMimeType: normalizedSegments[0].rawMimeType,
          size: finalBlob.size,
          originalSize: normalizedSegments.reduce(
            (totalSize, segment) => totalSize + segment.rawSize,
            0,
          ),
          width: normalizedSegments[0].clip.width,
          height: normalizedSegments[0].clip.height,
          aspectRatio: normalizedSegments[0].clip.aspectRatio,
          duration: finalDuration,
          defaultTrimRange: {
            start: 0,
            end: finalDuration,
          },
          hasAudio: finalHasAudio,
          swaprMetadata: {
            source: "swapr",
            sourcePhotoId: photo.id,
            referenceUgcClipId: clip.id,
            replicatePredictionId: completedPredictions[0].id,
            replicatePredictionIds: completedPredictions.map(
              (prediction) => prediction.id,
            ),
            sourceSegmentCount: referenceVideoSegments.length,
            modelId: SWAPR_MODEL_ID,
            mode: effectiveMode,
            characterOrientation: effectiveCharacterOrientation,
            prompt: prompt.trim() || undefined,
            keepOriginalSound,
          },
          createdAt: now,
          updatedAt: now,
        };

        await saveVideoClip({
          id: nextClip.id,
          name: nextClip.name,
          tags: nextClip.tags ?? [],
          originalName: nextClip.originalName,
          clipType: nextClip.clipType,
          videoObject: nextClip.videoObject,
          posterObject: nextClip.posterObject,
          posterVersion: nextClip.posterVersion,
          mimeType: nextClip.mimeType,
          sourceMimeType: nextClip.sourceMimeType,
          size: nextClip.size,
          originalSize: nextClip.originalSize,
          width: nextClip.width,
          height: nextClip.height,
          aspectRatio: nextClip.aspectRatio,
          duration: nextClip.duration,
          defaultTrimRange: nextClip.defaultTrimRange,
          hasAudio: nextClip.hasAudio,
          swaprMetadata: nextClip.swaprMetadata,
          createdAt: nextClip.createdAt,
          updatedAt: nextClip.updatedAt,
        });
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
