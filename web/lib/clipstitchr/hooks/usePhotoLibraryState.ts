"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { analyzeUploadAsset } from "@/lib/clipstitchr/client/analyzeUploadAsset";
import { expandSwaprPhotoWithAi } from "@/lib/clipstitchr/client/expandSwaprPhotoWithAi";
import { createImageThumbnailBlob } from "@/lib/clipstitchr/media/createImageThumbnailBlob";
import { createSwaprOutpaintInputs } from "@/lib/clipstitchr/media/createSwaprOutpaintInputs";
import { createSwaprPortraitPhotoBlob } from "@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
import { deletePhotoAsset } from "@/lib/clipstitchr/storage/deletePhotoAsset";
import { getPhotoAsset } from "@/lib/clipstitchr/storage/getPhotoAsset";
import { getPhotoAssets } from "@/lib/clipstitchr/storage/getPhotoAssets";
import { savePhotoAsset } from "@/lib/clipstitchr/storage/savePhotoAsset";
import { savePhotoAssetMetadata } from "@/lib/clipstitchr/storage/savePhotoAssetMetadata";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { PhotoLibraryValue } from "@/lib/clipstitchr/types/PhotoLibraryValue";
import type { SwaprPhotoPreparation } from "@/lib/clipstitchr/types/SwaprPhotoPreparation";
import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getImageNeedsSwaprOutpaint } from "@/lib/clipstitchr/utils/getImageNeedsSwaprOutpaint";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type SavePhotoFilesOptions = {
  shouldExpandWithAi?: boolean;
};

export function usePhotoLibraryState(): PhotoLibraryValue {
  const [photos, setPhotos] = useState<PhotoAssetMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoCacheRef = useRef(new Map<string, PhotoAsset>());

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

  const loadPhoto = useCallback(async (id: string) => {
    const cachedPhoto = photoCacheRef.current.get(id);

    if (cachedPhoto) {
      return cachedPhoto;
    }

    const photo = await getPhotoAsset(id);

    if (!photo) {
      return null;
    }

    photoCacheRef.current.set(id, photo);
    return photo;
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
          const fallbackName = getUploadFallbackName(file.name);
          let analysis: UploadAssetAnalysis = {
            name: fallbackName,
            tags: [],
          };

          try {
            analysis = await analyzeUploadAsset({
              blob: thumbnailBlob,
              mediaKind: "photo",
              originalName: file.name,
            });
          } catch {
            analysis = {
              name: fallbackName,
              tags: [],
            };
          }

          await savePhotoAsset({
            id: createId(),
            name: analysis.name,
            tags: normalizeAssetTagsWithRequiredTag(analysis.tags, "photo"),
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

  const updatePhotoMetadata = useCallback(
    async (photo: PhotoAssetMetadata, metadata: AssetMetadataUpdate) => {
      const updatedPhoto = {
        ...photo,
        name: metadata.name,
        tags: normalizeAssetTagsWithRequiredTag(metadata.tags, "photo"),
        updatedAt: new Date().toISOString(),
      };

      await savePhotoAssetMetadata(updatedPhoto);
      photoCacheRef.current.delete(photo.id);
      await refresh();
    },
    [refresh],
  );

  const removePhoto = useCallback(
    async (id: string) => {
      await deletePhotoAsset(id);
      photoCacheRef.current.delete(id);
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
    loadPhoto,
    saveFiles,
    updatePhotoMetadata,
    removePhoto,
  };
}
