"use client";

import { useCallback, useState } from "react";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipr/media/createVideoPosterBlob";
import { normalizeUploadedVideo } from "@/lib/clipr/media/normalizeUploadedVideo";
import { saveVideoClip } from "@/lib/clipr/storage/saveVideoClip";
import type { ClipType } from "@/lib/clipr/types/ClipType";
import type { UploadQueueItem } from "@/lib/clipr/types/UploadQueueItem";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import { createId } from "@/lib/clipr/utils/createId";

type UseUploadProcessorOptions = {
  onClipSaved?: (clip: VideoClip) => void | Promise<void>;
};

export function useUploadProcessor({ onClipSaved }: UseUploadProcessorOptions) {
  const [clipType, setClipType] = useState<ClipType>("ugc");
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

            const now = new Date().toISOString();
            const clip: VideoClip = {
              id: createId(),
              name: file.name.replace(/\.[^/.]+$/, ""),
              originalName: file.name,
              clipType: item.clipType,
              blob: normalized.blob,
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

            await saveVideoClip(clip);
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
    [clipType, onClipSaved, updateQueueItem],
  );

  const clearQueue = useCallback(() => setQueue([]), []);

  return {
    clipType,
    setClipType,
    queue,
    isProcessing,
    processFiles,
    clearQueue,
  };
}
