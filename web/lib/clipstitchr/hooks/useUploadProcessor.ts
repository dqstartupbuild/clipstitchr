"use client";

import { useCallback, useState } from "react";
import { createUploadVideoJob } from "@/lib/clipstitchr/client/createUploadVideoJob";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { UploadQueueItem } from "@/lib/clipstitchr/types/UploadQueueItem";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getUploadBatchLimit } from "@/lib/clipstitchr/utils/getUploadBatchLimit";
import { getUploadBatchLimitMessage } from "@/lib/clipstitchr/utils/getUploadBatchLimitMessage";

type UseUploadProcessorOptions = {
  initialClipType?: ClipType;
  demoProductId?: string;
  productId?: string;
  onClipSaved?: () => void | Promise<void>;
};

export function useUploadProcessor({
  demoProductId,
  initialClipType = "ugc",
  onClipSaved,
  productId,
}: UseUploadProcessorOptions) {
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

      const activeDemoProductId =
        clipType === "demo" ? demoProductId?.trim() : undefined;
      const activeProductId =
        clipType === "demo" ? activeDemoProductId : productId?.trim();

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

          updateQueueItem(item.id, { status: "reading", progress: 0.05 });

          try {
            const clipId = createId();
            const [sourceVideoObject] = await uploadBlobsToR2([
              {
                blob: file,
                kind: "upload-source-video",
                recordId: clipId,
              },
            ]);

            updateQueueItem(item.id, {
              status: "saving",
              progress: 0.9,
            });
            await createUploadVideoJob({
              clipId,
              clipType: item.clipType,
              originalName: file.name,
              productId: item.productId,
              sourceVideoObject,
            });
            await onClipSaved?.();

            updateQueueItem(item.id, {
              status: "queued",
              progress: 0.25,
            });
          } catch (error) {
            updateQueueItem(item.id, {
              status: "error",
              progress: 1,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to queue this video.",
            });
          }
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [clipType, demoProductId, onClipSaved, productId, updateQueueItem],
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
