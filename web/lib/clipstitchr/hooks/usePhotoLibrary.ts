"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { expandSwaprPhotoWithAi } from "@/lib/clipstitchr/client/expandSwaprPhotoWithAi";
import { createImageThumbnailBlob } from "@/lib/clipstitchr/media/createImageThumbnailBlob";
import { createSwaprOutpaintInputs } from "@/lib/clipstitchr/media/createSwaprOutpaintInputs";
import { createSwaprPortraitPhotoBlob } from "@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
import { deletePhotoAsset } from "@/lib/clipstitchr/storage/deletePhotoAsset";
import { getPhotoAssets } from "@/lib/clipstitchr/storage/getPhotoAssets";
import { savePhotoAsset } from "@/lib/clipstitchr/storage/savePhotoAsset";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { SwaprPhotoPreparation } from "@/lib/clipstitchr/types/SwaprPhotoPreparation";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getImageNeedsSwaprOutpaint } from "@/lib/clipstitchr/utils/getImageNeedsSwaprOutpaint";

type SavePhotoFilesOptions = {
  shouldExpandWithAi?: boolean;
};

export function usePhotoLibrary() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setPhotos(await getPhotoAssets());
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load saved photos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFiles = useCallback(
    async (
      files: FileList | File[],
      { shouldExpandWithAi = false }: SavePhotoFilesOptions = {},
    ) => {
      const selectedFiles = Array.from(files).filter((file) =>
        ACCEPTED_PHOTO_TYPES.includes(file.type),
      );

      if (!selectedFiles.length) {
        setError("Choose a JPG or PNG photo.");
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        for (const file of selectedFiles) {
          const originalDimensions = await getImageDimensions(file);
          const needsOutpaint = getImageNeedsSwaprOutpaint(
            originalDimensions.width,
            originalDimensions.height,
          );
          let normalizedBlob: Blob;
          let preparation: SwaprPhotoPreparation;

          if (needsOutpaint && shouldExpandWithAi) {
            const outpaintInputs = await createSwaprOutpaintInputs(file);
            const expandedBlob = await expandSwaprPhotoWithAi(
              outpaintInputs.imageBlob,
              outpaintInputs.maskBlob,
            );
            normalizedBlob = await createSwaprPortraitPhotoBlob(expandedBlob);
            preparation = "ai-outpaint";
          } else {
            normalizedBlob = await createSwaprPortraitPhotoBlob(file);
            preparation = needsOutpaint ? "auto-crop" : "original-portrait";
          }

          const thumbnailBlob = await createImageThumbnailBlob(normalizedBlob);
          const now = new Date().toISOString();

          await savePhotoAsset({
            id: createId(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            originalName: file.name,
            blob: normalizedBlob,
            originalBlob: file,
            thumbnailBlob,
            mimeType: normalizedBlob.type || "image/jpeg",
            originalMimeType: file.type,
            size: normalizedBlob.size,
            originalSize: file.size,
            width: TIKTOK_OUTPUT_WIDTH,
            height: TIKTOK_OUTPUT_HEIGHT,
            originalWidth: originalDimensions.width,
            originalHeight: originalDimensions.height,
            preparation,
            createdAt: now,
            updatedAt: now,
          });
        }

        await refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save this photo.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [refresh],
  );

  const removePhoto = useCallback(
    async (id: string) => {
      await deletePhotoAsset(id);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    photos,
    isLoading,
    isSaving,
    error,
    refresh,
    saveFiles,
    removePhoto,
  };
}
