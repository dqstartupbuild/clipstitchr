"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { defaultCliprContentType } from "@/lib/clipstitchr/constants/defaultCliprContentType";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createCliprJob } from "@/lib/clipstitchr/client/createCliprJob";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { composeCliprGeneratedVideo } from "@/lib/clipstitchr/media/composeCliprGeneratedVideo";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";
import { getCliprContentTypeTag } from "@/lib/clipstitchr/utils/getCliprContentTypeTag";
import { getCliprContentTypeUsesTextOverlay } from "@/lib/clipstitchr/utils/getCliprContentTypeUsesTextOverlay";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";

type GenerateCliprOptions = {
  addMusic: boolean;
  avatarId: string;
  contentType: CliprContentType;
  durationSeconds: CliprDurationSeconds;
  musicTrackId?: string;
  productId: string;
  voiceId: string;
};

type UseCliprGenerationOptions = {
  onCreated?: () => void | Promise<void>;
};

function getActiveJobProgress(job: CliprClientJob | null | undefined) {
  if (!job) {
    return null;
  }

  switch (job.stage) {
    case "hook-script":
      return {
        message: "Writing the full avatar script",
        progress: Math.max(0.08, Math.min(job.progress, 0.18)),
      };
    case "avatar-image":
      return {
        message: "Generating avatar source image",
        progress: Math.max(0.25, Math.min(job.progress, 0.38)),
      };
    case "avatar-video":
      return {
        message: job.music
          ? "Generating full avatar video and music"
          : "Generating full avatar video",
        progress: Math.max(0.45, Math.min(job.progress, 0.62)),
      };
    case "generated-video":
      return {
        message: "Generating Clipr video scenes",
        progress: Math.max(0.35, Math.min(job.progress, 0.62)),
      };
    case "media-compose":
      return {
        message: "Preparing generated scenes",
        progress: Math.max(0.62, Math.min(job.progress, 0.7)),
      };
    case "browser-save":
      return {
        message: "Avatar video generated",
        progress: Math.max(0.68, Math.min(job.progress, 0.7)),
      };
    default:
      return {
        message: "Starting Clipr generation",
        progress: Math.max(0.05, Math.min(job.progress, 0.1)),
      };
  }
}

export function useCliprGeneration({ onCreated }: UseCliprGenerationOptions) {
  const markBrowserSaving = useMutation(api.cliprJobs.markBrowserSaving);
  const finalizeWithClip = useMutation(api.cliprJobs.finalizeWithClip);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const activeJob = useQuery(
    api.cliprJobs.get,
    activeJobId ? { id: activeJobId } : "skip",
  ) as CliprClientJob | null | undefined;
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<CliprClientJob | null>(null);
  const [finalClipId, setFinalClipId] = useState<string | null>(null);
  const activeJobProgress =
    status === "reading" ? getActiveJobProgress(activeJob) : null;

  const createGeneratedClip = useCallback(
    async (
      object: R2ObjectReference,
      {
        fit,
        id,
        name,
        onProgress,
        tags,
      }: {
        fit: "contain" | "cover";
        id: string;
        name: string;
        onProgress?: (progress: number) => void;
        tags: string[];
      },
    ): Promise<VideoClip> => {
      const sourceBlob = await downloadBlobFromR2(object);
      const sourceFile = new File([sourceBlob], `${id}.mp4`, {
        type: sourceBlob.type || object.contentType,
      });
      const normalizedClip = await normalizeUploadedVideo(sourceFile, onProgress, {
        fit,
      });

      return {
        id,
        name,
        tags,
        originalName: sourceFile.name,
        clipType: "ugc",
        videoObject: object,
        blob: normalizedClip.blob,
        mimeType: normalizedClip.mimeType,
        sourceMimeType: sourceBlob.type || object.contentType,
        size: normalizedClip.blob.size,
        originalSize: sourceBlob.size,
        width: normalizedClip.metadata.width,
        height: normalizedClip.metadata.height,
        aspectRatio: normalizedClip.metadata.aspectRatio,
        duration: normalizedClip.metadata.duration,
        hasAudio: normalizedClip.metadata.hasAudio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [],
  );

  const createComposedGeneratedClip = useCallback(
    async (
      nextJob: CliprClientJob,
      {
        id,
        name,
        onProgress,
        tags,
      }: {
        id: string;
        name: string;
        onProgress?: (progress: number) => void;
        tags: string[];
      },
    ): Promise<VideoClip> => {
      const sceneObjects = nextJob.scenePlan
        .map((scene) => scene.generatedVideoObject)
        .filter((object): object is R2ObjectReference => Boolean(object));

      if (!sceneObjects.length) {
        throw new Error("Clipr did not return generated video scenes.");
      }

      const [sceneBlobs, voiceSourceBlob] = await Promise.all([
        Promise.all(sceneObjects.map((object) => downloadBlobFromR2(object))),
        (nextJob.contentType ?? defaultCliprContentType) ===
          "voiceover-reel" && nextJob.avatarVideoObject
          ? downloadBlobFromR2(nextJob.avatarVideoObject)
          : Promise.resolve(undefined),
      ]);
      const composedClip = await composeCliprGeneratedVideo({
        audioBlob: voiceSourceBlob,
        videoBlobs: sceneBlobs,
        onProgress,
      });
      const originalSize = sceneBlobs.reduce(
        (total, blob) => total + blob.size,
        voiceSourceBlob?.size ?? 0,
      );

      return {
        id,
        name,
        tags,
        originalName: `${id}.mp4`,
        clipType: "ugc",
        videoObject: sceneObjects[0],
        blob: composedClip.blob,
        mimeType: composedClip.mimeType,
        sourceMimeType: sceneBlobs[0]?.type || sceneObjects[0].contentType,
        size: composedClip.blob.size,
        originalSize,
        width: 1080,
        height: 1920,
        aspectRatio: 9 / 16,
        duration: composedClip.duration,
        hasAudio: Boolean(voiceSourceBlob),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [],
  );

  const generate = useCallback(
    async (options: GenerateCliprOptions) => {
      setStatus("reading");
      setProgress(0.05);
      setMessage("Starting Clipr generation");
      setError(null);
      setFinalClipId(null);
      const requestedJobId = createId();

      setActiveJobId(requestedJobId);

      try {
        const nextJob = await createCliprJob({
          ...options,
          jobId: requestedJobId,
        });
        const jobContentType = nextJob.contentType ?? defaultCliprContentType;

        setJob(nextJob);
        setProgress(0.7);
        setMessage(
          jobContentType === "avatar-talking-head"
            ? "Avatar video generated"
            : "Generated scenes ready",
        );

        if (!nextJob.scenePlan.length) {
          throw new Error("Clipr did not return the avatar script plan.");
        }

        if (
          jobContentType === "avatar-talking-head" && !nextJob.avatarVideoObject
        ) {
          throw new Error("Clipr did not return the generated avatar video.");
        }

        await markBrowserSaving({
          id: nextJob.id,
          updatedAt: new Date().toISOString(),
        });

        setStatus("normalizing");
        setMessage(
          jobContentType === "avatar-talking-head"
            ? "Downloading avatar video"
            : "Composing generated scenes",
        );
        setProgress(0.72);

        const clipId = createId();
        const clipName = getCliprFinalClipName(
          nextJob.productName,
          nextJob.createdAt,
        );
        const tags = [
          "ugc",
          "clipr",
          getCliprContentTypeTag(jobContentType),
        ];
        const avatarClip =
          jobContentType === "avatar-talking-head" &&
          nextJob.avatarVideoObject
            ? await createGeneratedClip(nextJob.avatarVideoObject, {
                fit: "cover",
                id: clipId,
                name: clipName,
                tags,
                onProgress: (avatarProgress) =>
                  setProgress(0.72 + avatarProgress * 0.2),
              })
            : await createComposedGeneratedClip(nextJob, {
                id: clipId,
                name: clipName,
                tags,
                onProgress: (composeProgress) =>
                  setProgress(0.72 + composeProgress * 0.2),
              });
        const textOverlay = getCliprContentTypeUsesTextOverlay(
          jobContentType,
        )
          ? {
              ...createDefaultTextOverlay(avatarClip.duration, 0),
              text:
                nextJob.overlayText?.trim() ||
                nextJob.filledHook?.trim() ||
                "Your text here",
            }
          : undefined;
        let posterBlob: Blob | undefined;

        setMessage("Generating poster");
        try {
          posterBlob = await createVideoPosterBlob(avatarClip.blob);
        } catch {
          posterBlob = undefined;
        }

        setStatus("saving");
        setMessage("Saving Clip to library");
        setProgress(0.94);

        const [videoObject, posterObject] = await uploadBlobsToR2([
          {
            blob: avatarClip.blob,
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
        const now = new Date().toISOString();
        const savedClipId = await finalizeWithClip({
          id: nextJob.id,
          clipId,
          name: clipName,
          videoObject,
          posterObject,
          posterVersion: posterBlob
            ? VIDEO_POSTER_CAPTURE_VERSION
            : undefined,
          mimeType: avatarClip.mimeType,
          sourceMimeType: avatarClip.sourceMimeType,
          size: avatarClip.blob.size,
          originalSize: avatarClip.originalSize,
          width: avatarClip.width,
          height: avatarClip.height,
          aspectRatio: avatarClip.aspectRatio,
          duration: avatarClip.duration,
          hasAudio: avatarClip.hasAudio,
          tags,
          textOverlay,
          updatedAt: now,
        });

        await onCreated?.();

        setFinalClipId(savedClipId);
        setActiveJobId(null);
        setProgress(1);
        setMessage("Clip saved");
        setStatus("complete");

        return savedClipId;
      } catch (nextError) {
        setActiveJobId(null);
        setStatus("error");
        setProgress(1);
        setMessage("Generation stopped");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Clipr clip.",
        );
        return null;
      }
    },
    [
      createGeneratedClip,
      createComposedGeneratedClip,
      finalizeWithClip,
      markBrowserSaving,
      onCreated,
    ],
  );

  return {
    error,
    finalClipId,
    generate,
    isGenerating:
      status !== "idle" && status !== "complete" && status !== "error",
    job: activeJob ?? job,
    message: activeJobProgress?.message ?? message,
    progress: activeJobProgress?.progress ?? progress,
    status,
  };
}
