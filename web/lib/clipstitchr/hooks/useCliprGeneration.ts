"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createCliprJob } from "@/lib/clipstitchr/client/createCliprJob";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import { stitchNormalizedVideoSequence } from "@/lib/clipstitchr/media/stitchNormalizedVideoSequence";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoSequenceClip } from "@/lib/clipstitchr/types/VideoSequenceClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";

type GenerateCliprOptions = {
  avatarId: string;
  durationSeconds: CliprDurationSeconds;
  makeDefaultVoice: boolean;
  productId: string;
  voiceId: string;
};

type UseCliprGenerationOptions = {
  onCreated?: () => void | Promise<void>;
};

export function useCliprGeneration({ onCreated }: UseCliprGenerationOptions) {
  const markBrowserStitching = useMutation(api.cliprJobs.markBrowserStitching);
  const finalizeWithClip = useMutation(api.cliprJobs.finalizeWithClip);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<CliprClientJob | null>(null);
  const [finalClipId, setFinalClipId] = useState<string | null>(null);

  const createSceneClip = useCallback(
    async (
      scene: CliprClientJob["scenePlan"][number],
      sceneIndex: number,
      sceneCount: number,
    ): Promise<VideoSequenceClip> => {
      if (!scene.generatedVideoObject) {
        throw new Error("A Clipr scene is missing its generated video.");
      }

      const sceneBlob = await downloadBlobFromR2(scene.generatedVideoObject);
      const sceneFile = new File([sceneBlob], `${scene.id}.mp4`, {
        type: sceneBlob.type || scene.generatedVideoObject.contentType,
      });
      const normalizedScene = await normalizeUploadedVideo(
        sceneFile,
        (sceneProgress) =>
          setProgress(0.88 + ((sceneIndex + sceneProgress) / sceneCount) * 0.06),
        { fit: "cover" },
      );
      const clip: VideoClip = {
        id: scene.id,
        name: `Clipr scene ${scene.index + 1}`,
        tags: ["clipr-scene"],
        originalName: sceneFile.name,
        clipType: "ugc",
        videoObject: scene.generatedVideoObject,
        blob: normalizedScene.blob,
        mimeType: normalizedScene.mimeType,
        sourceMimeType: sceneBlob.type || scene.generatedVideoObject.contentType,
        size: normalizedScene.blob.size,
        originalSize: sceneBlob.size,
        width: normalizedScene.metadata.width,
        height: normalizedScene.metadata.height,
        aspectRatio: normalizedScene.metadata.aspectRatio,
        duration: normalizedScene.metadata.duration,
        hasAudio: normalizedScene.metadata.hasAudio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        clip,
        trimRange: {
          start: 0,
          end: normalizedScene.metadata.duration,
        },
      };
    },
    [],
  );

  const generate = useCallback(
    async (options: GenerateCliprOptions) => {
      setStatus("reading");
      setProgress(0);
      setError(null);
      setFinalClipId(null);

      try {
        const nextJob = await createCliprJob(options);

        setJob(nextJob);
        setProgress(0.88);

        if (!nextJob.scenePlan.length) {
          throw new Error("Clipr did not return any generated scenes.");
        }

        await markBrowserStitching({
          id: nextJob.id,
          updatedAt: new Date().toISOString(),
        });

        const sceneClips: VideoSequenceClip[] = [];

        for (let index = 0; index < nextJob.scenePlan.length; index += 1) {
          sceneClips.push(
            await createSceneClip(
              nextJob.scenePlan[index],
              index,
              nextJob.scenePlan.length,
            ),
          );
        }

        setStatus("stitching");

        const stitched = await stitchNormalizedVideoSequence(sceneClips, {
          targetDuration: nextJob.targetDurationSeconds,
          onProgress: (stitchProgress) =>
            setProgress(0.94 + stitchProgress * 0.04),
        });
        const clipId = createId();
        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(stitched.blob);
        } catch {
          posterBlob = undefined;
        }

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
        const now = new Date().toISOString();
        const savedClipId = await finalizeWithClip({
          id: nextJob.id,
          clipId,
          name: getCliprFinalClipName(nextJob.productName, nextJob.createdAt),
          videoObject,
          posterObject,
          posterVersion: posterBlob
            ? VIDEO_POSTER_CAPTURE_VERSION
            : undefined,
          mimeType: stitched.mimeType,
          sourceMimeType: stitched.mimeType,
          size: stitched.blob.size,
          originalSize: stitched.blob.size,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          aspectRatio: TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT,
          duration: stitched.duration,
          hasAudio: stitched.hasAudio,
          updatedAt: now,
        });

        await onCreated?.();

        setFinalClipId(savedClipId);
        setProgress(1);
        setStatus("complete");

        return savedClipId;
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate this Clipr clip.",
        );
        return null;
      }
    },
    [createSceneClip, finalizeWithClip, markBrowserStitching, onCreated],
  );

  return {
    error,
    finalClipId,
    generate,
    job,
    progress,
    status,
  };
}
