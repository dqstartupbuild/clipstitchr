"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { analyzeUploadAsset } from "@/lib/clipstitchr/client/analyzeUploadAsset";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { UploadQueueItem } from "@/lib/clipstitchr/types/UploadQueueItem";
import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { getUploadBatchLimit } from "@/lib/clipstitchr/utils/getUploadBatchLimit";
import { getUploadBatchLimitMessage } from "@/lib/clipstitchr/utils/getUploadBatchLimitMessage";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type UseUploadProcessorOptions = {
  initialClipType?: ClipType;
  onClipSaved?: (clip: VideoClip) => void | Promise<void>;
};

export function useUploadProcessor({
  initialClipType = "ugc",
  onClipSaved,
}: UseUploadProcessorOptions) {
  const saveVideoClip = useMutation(api.videoClips.save);
  const [clipType, setClipType] = useState<ClipType>(initialClipType);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQueueItem = useCallback(
    (id: string, update: Partial<UploadQueueItem>) => {
      setQueue((items) =>
        items.map((item) => (item.id === id ? { ...item, ...update } : item)),
      );
    },
    [],
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const selectedFiles = Array.from(files).filter((file) =>
        file.type.startsWith("video/"),
      );

      if (selectedFiles.length === 0) {
        return;
      }

      const uploadBatchLimit = getUploadBatchLimit({
        assetType: clipType,
        shouldExpandWithAi: false,
      });

      if (selectedFiles.length > uploadBatchLimit) {
        setError(
          getUploadBatchLimitMessage({
            assetType: clipType,
            limit: uploadBatchLimit,
            shouldExpandWithAi: false,
          }),
        );
        return;
      }

      setError(null);

      const queueItems = selectedFiles.map<UploadQueueItem>((file) => ({
        id: createId(),
        fileName: file.name,
        fileSize: file.size,
        clipType,
        status: "idle",
        progress: 0,
      }));

      setQueue((items) => [...queueItems, ...items]);
      setIsProcessing(true);

      try {
        for (const [index, file] of selectedFiles.entries()) {
          const item = queueItems[index];

          updateQueueItem(item.id, { status: "reading", progress: 0.05 });

          try {
            const normalized = await normalizeUploadedVideo(file, (progress) => {
              updateQueueItem(item.id, {
                status: "normalizing",
                progress: Math.max(0.05, Math.min(0.95, progress)),
              });
            });
            let posterBlob: Blob | undefined;

            try {
              posterBlob = await createVideoPosterBlob(normalized.blob);
            } catch {
              posterBlob = undefined;
            }

            const fallbackName = getUploadFallbackName(file.name);
            let analysis: UploadAssetAnalysis = {
              name: fallbackName,
              tags: [],
            };

            if (posterBlob) {
              updateQueueItem(item.id, {
                status: "analyzing",
                progress: 0.97,
              });

              try {
                analysis = await analyzeUploadAsset({
                  blob: posterBlob,
                  mediaKind:
                    item.clipType === "ugc" ? "ugc-video" : "demo-video",
                  originalName: file.name,
                });
              } catch {
                analysis = {
                  name: fallbackName,
                  tags: [],
                };
              }
            }

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
            const clip: VideoClip = {
              id: clipId,
              name: analysis.name,
              tags: normalizeAssetTagsWithRequiredTag(
                analysis.tags,
                item.clipType,
              ),
              videoDescription: analysis.videoDescription,
              mainPersonDescription: analysis.mainPersonDescription,
              outfitDescription: analysis.outfitDescription,
              locationDescription: analysis.locationDescription,
              poseDescription: analysis.poseDescription,
              productDescription: analysis.productDescription,
              originalName: file.name,
              clipType: item.clipType,
              videoObject,
              blob: normalized.blob,
              posterObject,
              posterBlob,
              posterVersion: posterBlob
                ? VIDEO_POSTER_CAPTURE_VERSION
                : undefined,
              mimeType: normalized.mimeType,
              sourceMimeType: file.type || normalized.metadata.mimeType,
              size: normalized.blob.size,
              originalSize: file.size,
              width: normalized.metadata.width,
              height: normalized.metadata.height,
              aspectRatio: normalized.metadata.aspectRatio,
              duration: normalized.metadata.duration,
              defaultTrimRange: {
                start: 0,
                end: normalized.metadata.duration,
              },
              hasAudio: normalized.metadata.hasAudio,
              createdAt: now,
              updatedAt: now,
            };

            await saveVideoClip({
              id: clip.id,
              name: clip.name,
              tags: clip.tags ?? [],
              videoDescription: clip.videoDescription,
              mainPersonDescription: clip.mainPersonDescription,
              outfitDescription: clip.outfitDescription,
              locationDescription: clip.locationDescription,
              poseDescription: clip.poseDescription,
              productDescription: clip.productDescription,
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
            });
            await onClipSaved?.(clip);

            updateQueueItem(item.id, {
              status: "complete",
              progress: 1,
            });
          } catch (error) {
            updateQueueItem(item.id, {
              status: "error",
              progress: 1,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to normalize this video.",
            });
          }
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [clipType, onClipSaved, saveVideoClip, updateQueueItem],
  );

  const clearQueue = useCallback(() => setQueue([]), []);

  return {
    clipType,
    setClipType,
    queue,
    isProcessing,
    error,
    processFiles,
    clearQueue,
  };
}
