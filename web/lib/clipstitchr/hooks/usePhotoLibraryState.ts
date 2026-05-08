"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createPhotoAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createPhotoAssetFromConvexDocument";
import { createPhotoAssetMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createPhotoAssetMetadataFromConvexDocument";
import { getDefinedR2Objects } from "@/lib/clipstitchr/backend/getDefinedR2Objects";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { analyzeUploadAsset } from "@/lib/clipstitchr/client/analyzeUploadAsset";
import { expandSwaprPhotoWithAi } from "@/lib/clipstitchr/client/expandSwaprPhotoWithAi";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { uploadBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobToR2";
import { createImageThumbnailBlob } from "@/lib/clipstitchr/media/createImageThumbnailBlob";
import { createSwaprOutpaintInputs } from "@/lib/clipstitchr/media/createSwaprOutpaintInputs";
import { createSwaprPortraitPhotoBlob } from "@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
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
  const convex = useConvex();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const photoDocuments = useQuery(
    api.photoAssets.list,
    isAuthenticated ? {} : "skip",
  );
  const savePhotoAsset = useMutation(api.photoAssets.save);
  const updatePhotoMetadataMutation = useMutation(api.photoAssets.updateMetadata);
  const removePhotoMutation = useMutation(api.photoAssets.remove);
  const [photos, setPhotos] = useState<PhotoAssetMetadata[]>([]);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const photoCacheRef = useRef(new Map<string, PhotoAsset>());

  const refresh = useCallback(async () => {
    setRefreshNonce((currentNonce) => currentNonce + 1);
  }, []);

  const loadPhoto = useCallback(async (id: string) => {
    const cachedPhoto = photoCacheRef.current.get(id);

    if (cachedPhoto) {
      return cachedPhoto;
    }

    const photoDocument =
      photoDocuments?.find((photo) => photo.id === id) ??
      (await convex.query(api.photoAssets.get, { id }));

    if (!photoDocument) {
      return null;
    }

    const [blob, originalBlob, thumbnailBlob] = await Promise.all([
      downloadBlobFromR2(photoDocument.photoObject),
      photoDocument.originalObject
        ? downloadBlobFromR2(photoDocument.originalObject)
        : Promise.resolve(undefined),
      photoDocument.thumbnailObject
        ? downloadBlobFromR2(photoDocument.thumbnailObject)
        : Promise.resolve(undefined),
    ]);
    const photo = createPhotoAssetFromConvexDocument({
      photo: photoDocument,
      blob,
      originalBlob,
      thumbnailBlob,
    });

    photoCacheRef.current.set(id, photo);
    return photo;
  }, [convex, photoDocuments]);

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

          const photoId = createId();
          const [photoObject, originalObject, thumbnailObject] =
            await Promise.all([
              uploadBlobToR2({
                blob: normalizedBlob,
                kind: "photo",
                recordId: photoId,
              }),
              uploadBlobToR2({
                blob: file,
                kind: "photo-original",
                recordId: photoId,
              }),
              uploadBlobToR2({
                blob: thumbnailBlob,
                kind: "photo-thumbnail",
                recordId: photoId,
              }),
            ]);
          const photo: PhotoAsset = {
            id: photoId,
            name: analysis.name,
            tags: normalizeAssetTagsWithRequiredTag(analysis.tags, "photo"),
            originalName: file.name,
            photoObject,
            blob: normalizedBlob,
            originalObject,
            originalBlob: file,
            thumbnailObject,
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
          };

          await savePhotoAsset({
            id: photo.id,
            name: photo.name,
            tags: photo.tags ?? [],
            originalName: photo.originalName,
            photoObject: photo.photoObject,
            originalObject: photo.originalObject,
            thumbnailObject: photo.thumbnailObject,
            mimeType: photo.mimeType,
            originalMimeType: photo.originalMimeType,
            size: photo.size,
            originalSize: photo.originalSize,
            width: photo.width,
            height: photo.height,
            originalWidth: photo.originalWidth,
            originalHeight: photo.originalHeight,
            preparation: photo.preparation,
            consentAcknowledgedAt: photo.consentAcknowledgedAt,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
          });
          photoCacheRef.current.set(photo.id, photo);
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
    [refresh, savePhotoAsset],
  );

  const updatePhotoMetadata = useCallback(
    async (photo: PhotoAssetMetadata, metadata: AssetMetadataUpdate) => {
      const updatedPhoto = {
        ...photo,
        name: metadata.name,
        tags: normalizeAssetTagsWithRequiredTag(metadata.tags, "photo"),
        updatedAt: new Date().toISOString(),
      };

      await updatePhotoMetadataMutation({
        id: photo.id,
        name: updatedPhoto.name,
        tags: updatedPhoto.tags ?? [],
        updatedAt: updatedPhoto.updatedAt,
      });
      photoCacheRef.current.delete(photo.id);
      await refresh();
    },
    [refresh, updatePhotoMetadataMutation],
  );

  const removePhoto = useCallback(
    async (id: string) => {
      const photoDocument =
        photoDocuments?.find((photo) => photo.id === id) ??
        (await convex.query(api.photoAssets.get, { id }));

      if (photoDocument) {
        await deleteObjectsFromR2(
          getDefinedR2Objects([
            photoDocument.photoObject,
            photoDocument.originalObject,
            photoDocument.thumbnailObject,
          ]),
        );
      }

      await removePhotoMutation({ id });
      photoCacheRef.current.delete(id);
      await refresh();
    },
    [convex, photoDocuments, refresh, removePhotoMutation],
  );

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !photoDocuments) {
      if (!isAuthLoading && !isAuthenticated) {
        void Promise.resolve().then(() => {
          setPhotos([]);
        });
      }

      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) {
        return;
      }

      setIsHydrating(true);
      setError(null);

      try {
        const nextPhotos = await Promise.all(
          photoDocuments.map(async (photo) => {
            const thumbnailBlob = photo.thumbnailObject
              ? await downloadBlobFromR2(photo.thumbnailObject).catch(
                  () => undefined,
                )
              : undefined;

            return createPhotoAssetMetadataFromConvexDocument(
              photo,
              thumbnailBlob,
            );
          }),
        );

        if (!isCancelled) {
          setPhotos(nextPhotos);
        }
      } catch (nextError) {
        if (!isCancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Unable to load saved photos.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, photoDocuments, refreshNonce]);

  return {
    photos,
    isLoading:
      isAuthLoading ||
      (isAuthenticated && photoDocuments === undefined) ||
      isHydrating,
    isSaving,
    error,
    refresh,
    loadPhoto,
    saveFiles,
    updatePhotoMetadata,
    removePhoto,
  };
}
