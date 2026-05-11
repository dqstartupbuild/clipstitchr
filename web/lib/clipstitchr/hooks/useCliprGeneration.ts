"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { CLIPR_SEEDANCE_MAX_DURATION_SECONDS } from "@/lib/clipstitchr/constants/cliprSeedanceSettings";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import {
  stitchNormalizedVideoClips,
  type NormalizedVideoClipSegment,
} from "@/lib/clipstitchr/media/stitchNormalizedVideoClips";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationStatus } from "@/lib/clipstitchr/types/CliprGenerationStatus";
import type { CliprSegmentResponse } from "@/lib/clipstitchr/types/CliprSegmentResponse";
import type { CliprSegmentStatusResponse } from "@/lib/clipstitchr/types/CliprSegmentStatusResponse";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";
import { getCliprSeedanceSegmentDurationSeconds } from "@/lib/clipstitchr/utils/getCliprSeedanceSegmentDurationSeconds";
import { readCliprSegmentResponse } from "@/lib/clipstitchr/utils/readCliprSegmentResponse";
import { readCliprSegmentStatusResponse } from "@/lib/clipstitchr/utils/readCliprSegmentStatusResponse";
import { waitForCliprPollInterval } from "@/lib/clipstitchr/utils/waitForCliprPollInterval";

const CLIPR_FOLLOW_UP_GAP_SECONDS = 4;
const CLIPR_SEGMENT_RECOVERY_COUNT = 1;

type GenerateCliprVideoOptions = {
  durationSeconds: CliprDurationSeconds;
  photo: PhotoAsset;
  product: ProductProfile;
  voice: string;
};

type CliprGeneratedSegment = {
  response: CliprSegmentResponse;
  normalized: NormalizedVideoClipSegment;
  rawSize: number;
};

function createPhotoFile(photo: PhotoAsset) {
  return new File([photo.blob], photo.originalName || `${photo.name}.jpg`, {
    type: photo.mimeType || "image/jpeg",
  });
}

async function downloadCliprOutput({
  predictionId,
  url,
}: {
  predictionId: string;
  url: string;
}) {
  const response = await fetch(
    `/api/clipr/output?id=${encodeURIComponent(predictionId)}&url=${encodeURIComponent(url)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to download the generated Clipr output.");
  }

  return await response.blob();
}

function isTerminalPredictionStatus(status: SwaprPredictionStatus) {
  return (
    status === "succeeded" ||
    status === "failed" ||
    status === "canceled" ||
    status === "aborted"
  );
}

function getPredictionErrorMessage(error: unknown) {
  return typeof error === "string"
    ? error
    : error
      ? JSON.stringify(error)
      : "Replicate did not complete this Clipr segment.";
}

export function useCliprGeneration(onClipSaved?: () => void | Promise<void>) {
  const saveVideoClip = useMutation(api.videoClips.save);
  const [status, setStatus] = useState<CliprGenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedClip, setGeneratedClip] = useState<VideoClip | null>(null);
  const [segments, setSegments] = useState<CliprSegmentResponse[]>([]);

  const createSegment = useCallback(
    async ({
      durationSeconds,
      photo,
      previousScripts,
      product,
      remainingSeconds,
      segmentIndex,
      voice,
    }: GenerateCliprVideoOptions & {
      previousScripts: string;
      remainingSeconds: number;
      segmentIndex: number;
    }): Promise<CliprGeneratedSegment> => {
      setStatus("scripting");

      const formData = new FormData();
      formData.set("image", createPhotoFile(photo));
      formData.set("productId", product.id);
      formData.set("durationSeconds", String(durationSeconds));
      formData.set("voice", voice);
      formData.set("previousScripts", previousScripts);
      formData.set("remainingSeconds", String(remainingSeconds));
      formData.set("segmentIndex", String(segmentIndex));

      const segmentResponse = await fetch("/api/clipr/segments", {
        method: "POST",
        body: formData,
      });
      const response = await readCliprSegmentResponse(segmentResponse);
      let segmentStatus: CliprSegmentStatusResponse = {
        videoPredictionId: response.videoPredictionId,
        status: response.videoStatus,
        videoUrl: response.videoUrl,
      };

      setSegments((currentSegments) => [...currentSegments, response]);
      setStatus("avatar");
      setProgress((currentProgress) => Math.max(currentProgress, 0.18));

      while (!isTerminalPredictionStatus(segmentStatus.status)) {
        await waitForCliprPollInterval();

        const pollResponse = await fetch(
          `/api/clipr/segments/${response.videoPredictionId}`,
        );
        segmentStatus = await readCliprSegmentStatusResponse(pollResponse);
        setProgress((currentProgress) => Math.min(0.65, currentProgress + 0.015));
      }

      if (segmentStatus.status !== "succeeded") {
        throw new Error(getPredictionErrorMessage(segmentStatus.error));
      }

      if (!segmentStatus.videoUrl) {
        throw new Error("Replicate completed but did not return Clipr video.");
      }

      setStatus("downloading");

      const rawOutputBlob = await downloadCliprOutput({
        predictionId: response.videoPredictionId,
        url: segmentStatus.videoUrl,
      });
      const outputFile = new File(
        [rawOutputBlob],
        `${product.name}-clipr-${segmentIndex}.mp4`,
        {
          type: rawOutputBlob.type || "video/mp4",
        },
      );

      setStatus("normalizing");

      const normalized = await normalizeUploadedVideo(
        outputFile,
        (nextProgress) =>
          setProgress((currentProgress) =>
            Math.max(currentProgress, 0.2 + nextProgress * 0.45),
          ),
        { fit: "cover" },
      );

      return {
        response,
        normalized: {
          blob: normalized.blob,
          duration: normalized.metadata.duration,
          mimeType: normalized.mimeType,
        },
        rawSize: rawOutputBlob.size,
      };
    },
    [],
  );

  const generate = useCallback(
    async ({ durationSeconds, photo, product, voice }: GenerateCliprVideoOptions) => {
      setStatus("generating");
      setProgress(0.02);
      setError(null);
      setGeneratedClip(null);
      setSegments([]);

      try {
        const generatedSegments: CliprGeneratedSegment[] = [];
        let totalDuration = 0;
        let previousScripts = "";
        const maxSegmentCount =
          Math.ceil(durationSeconds / CLIPR_SEEDANCE_MAX_DURATION_SECONDS) +
          CLIPR_SEGMENT_RECOVERY_COUNT;

        while (
          generatedSegments.length < maxSegmentCount &&
          (generatedSegments.length === 0 ||
            totalDuration < durationSeconds - CLIPR_FOLLOW_UP_GAP_SECONDS)
        ) {
          const segmentIndex = generatedSegments.length + 1;
          const remainingSeconds = getCliprSeedanceSegmentDurationSeconds(
            durationSeconds - totalDuration,
          );
          const segment = await createSegment({
            durationSeconds,
            photo,
            previousScripts,
            product,
            remainingSeconds,
            segmentIndex,
            voice,
          });

          generatedSegments.push(segment);
          totalDuration += segment.normalized.duration;
          previousScripts = generatedSegments
            .map((item) => item.response.script)
            .join("\n\n");
          setProgress(Math.min(0.72, totalDuration / durationSeconds * 0.72));
        }

        const normalizedSegments = generatedSegments.map(
          (segment) => segment.normalized,
        );
        const stitched =
          normalizedSegments.length > 1
            ? await Promise.resolve()
                .then(() => {
                  setStatus("stitching");
                  return stitchNormalizedVideoClips(normalizedSegments, {
                    onProgress: (nextProgress) =>
                      setProgress(0.72 + nextProgress * 0.18),
                  });
                })
            : normalizedSegments[0];

        if (!stitched) {
          throw new Error("Clipr did not return a generated video.");
        }

        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(stitched.blob);
        } catch {
          posterBlob = undefined;
        }

        setStatus("saving");
        setProgress(0.94);

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
        const firstSegment = generatedSegments[0].response;
        const nextClip: VideoClip = {
          id: clipId,
          name: `Clipr - ${firstSegment.title}`,
          tags: normalizeAssetTagsWithRequiredTag(
            ["clipr", product.name],
            "ugc",
          ),
          videoDescription: previousScripts,
          productDescription: product.productDetails,
          originalName: `${product.name}-clipr.mp4`,
          clipType: "ugc",
          videoObject,
          blob: stitched.blob,
          posterObject,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: stitched.mimeType,
          sourceMimeType:
            generatedSegments[0].normalized.mimeType || stitched.mimeType,
          size: stitched.blob.size,
          originalSize: generatedSegments.reduce(
            (totalSize, segment) => totalSize + segment.rawSize,
            0,
          ),
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          aspectRatio: TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT,
          duration: stitched.duration,
          defaultTrimRange: {
            start: 0,
            end: stitched.duration,
          },
          hasAudio: true,
          createdAt: now,
          updatedAt: now,
        };

        await saveVideoClip({
          id: nextClip.id,
          name: nextClip.name,
          tags: nextClip.tags ?? [],
          videoDescription: nextClip.videoDescription,
          productDescription: nextClip.productDescription,
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
          createdAt: nextClip.createdAt,
          updatedAt: nextClip.updatedAt,
        });

        await onClipSaved?.();
        setGeneratedClip(nextClip);
        setProgress(1);
        setStatus("succeeded");
      } catch (nextError) {
        setStatus("failed");
        setProgress(1);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Clipr video.",
        );
      }
    },
    [createSegment, onClipSaved, saveVideoClip],
  );

  return {
    status,
    progress,
    error,
    generatedClip,
    segments,
    isGenerating:
      status !== "idle" && status !== "succeeded" && status !== "failed",
    generate,
  };
}
