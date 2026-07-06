"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { analyzeNormalizedVideoUpload } from "@/lib/clipstitchr/client/analyzeNormalizedVideoUpload";
import { createBrowserUploadVideoClipSaveArgs } from "@/lib/clipstitchr/client/createBrowserUploadVideoClipSaveArgs";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { uploadNormalizedVideoClipObjects } from "@/lib/clipstitchr/client/r2/uploadNormalizedVideoClipObjects";
import { queueUploadVideoWorkerFallback } from "@/lib/clipstitchr/client/queueUploadVideoWorkerFallback";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";
import { readFileClipMetadata } from "@/lib/clipstitchr/media/readFileClipMetadata";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { UploadQueueItem } from "@/lib/clipstitchr/types/UploadQueueItem";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getClipShouldUseUploadBackgroundLayout } from "@/lib/clipstitchr/utils/getClipShouldUseUploadBackgroundLayout";
import { getUploadBatchLimit } from "@/lib/clipstitchr/utils/getUploadBatchLimit";
import { getUploadBatchLimitMessage } from "@/lib/clipstitchr/utils/getUploadBatchLimitMessage";

type UseUploadProcessorOptions = {
  initialClipType?: ClipType;
  demoProductId?: string;
  onClipSaved?: () => void | Promise<void>;
};

export function useUploadProcessor({
  demoProductId,
  initialClipType = "ugc",
  onClipSaved,
}: UseUploadProcessorOptions) {
  const [clipType, setClipType] = useState<ClipType>(initialClipType);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveClip = useMutation(api.videoClips.save);

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

      const activeDemoProductId =
        clipType === "demo" ? demoProductId?.trim() : undefined;
      const activeProductId =
        clipType === "demo" ? activeDemoProductId : undefined;

      if (clipType === "demo" && !activeDemoProductId) {
        setError("Choose a product before uploading demo videos.");
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
        productId: activeProductId,
        status: "idle",
        progress: 0,
      }));

      setQueue((items) => [...queueItems, ...items]);
      setIsProcessing(true);

      try {
        for (const [index, file] of selectedFiles.entries()) {
          const item = queueItems[index];
          let uploadedObjects: R2ObjectReference[] = [];

          updateQueueItem(item.id, { status: "reading", progress: 0.05 });

          try {
            const clipId = createId();
            let normalizedVideo: Awaited<ReturnType<typeof normalizeUploadedVideo>>;
            let posterBlob: Blob;
            const sourceMetadata = await readFileClipMetadata(file).catch(
              () => null,
            );
            const shouldUseWorkerNormalization =
              sourceMetadata &&
              getClipShouldUseUploadBackgroundLayout({
                clipType: item.clipType,
                sourceAspectRatio: sourceMetadata.aspectRatio,
              });

            if (shouldUseWorkerNormalization) {
              updateQueueItem(item.id, {
                status: "reading",
                progress: 0.05,
              });
              await queueUploadVideoWorkerFallback({
                clipId,
                clipType: item.clipType,
                file,
                layout: "fit-with-background",
                productId: item.productId,
              });
              await onClipSaved?.();

              updateQueueItem(item.id, {
                status: "queued",
                progress: 0.25,
              });
              continue;
            }

            try {
              updateQueueItem(item.id, {
                status: "normalizing",
                progress: 0.05,
              });
              normalizedVideo = await normalizeUploadedVideo(
                file,
                (progress) =>
                  updateQueueItem(item.id, {
                    status: "normalizing",
                    progress: 0.05 + progress * 0.45,
                  }),
                { fit: "cover" },
              );
              updateQueueItem(item.id, {
                status: "normalizing",
                progress: 0.55,
              });
              posterBlob = await createVideoPosterBlob(normalizedVideo.blob);
            } catch {
              updateQueueItem(item.id, {
                status: "reading",
                progress: 0.05,
              });
              await queueUploadVideoWorkerFallback({
                clipId,
                clipType: item.clipType,
                file,
                layout: undefined,
                productId: item.productId,
              });
              await onClipSaved?.();

              updateQueueItem(item.id, {
                status: "queued",
                progress: 0.25,
              });
              continue;
            }

            updateQueueItem(item.id, {
              status: "saving",
              progress: 0.65,
            });
            const { posterObject, videoObject } =
              await uploadNormalizedVideoClipObjects({
                clipId,
                posterBlob,
                videoBlob: normalizedVideo.blob,
              });
            uploadedObjects = [videoObject, posterObject];

            updateQueueItem(item.id, {
              status: "analyzing",
              progress: 0.8,
            });
            const analysis = await analyzeNormalizedVideoUpload({
              clipType: item.clipType,
              originalName: file.name,
              posterBlob,
              videoObject,
            });

            updateQueueItem(item.id, {
              status: "saving",
              progress: 0.95,
            });
            const updatedAt = new Date().toISOString();

            await saveClip(
              createBrowserUploadVideoClipSaveArgs({
                analysis,
                clipId,
                clipType: item.clipType,
                metadata: normalizedVideo.metadata,
                mimeType: normalizedVideo.mimeType,
                originalName: file.name,
                originalSize: file.size,
                posterObject,
                productId: item.productId,
                sourceMimeType: file.type || normalizedVideo.metadata.mimeType,
                updatedAt,
                videoObject,
              }),
            );
            uploadedObjects = [];
            await onClipSaved?.();

            updateQueueItem(item.id, {
              status: "complete",
              progress: 1,
            });
          } catch (error) {
            if (uploadedObjects.length > 0) {
              await deleteObjectsFromR2(uploadedObjects).catch(() => null);
            }

            updateQueueItem(item.id, {
              status: "error",
              progress: 1,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to upload this video.",
            });
          }
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [clipType, demoProductId, onClipSaved, saveClip, updateQueueItem],
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
