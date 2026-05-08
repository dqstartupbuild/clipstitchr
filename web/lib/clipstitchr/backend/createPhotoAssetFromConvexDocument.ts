import type { Doc } from "@/convex/_generated/dataModel";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

type CreatePhotoAssetFromConvexDocumentOptions = {
  photo: Doc<"photoAssets">;
  blob: Blob;
  originalBlob?: Blob;
  thumbnailBlob?: Blob;
};

export function createPhotoAssetFromConvexDocument({
  photo,
  blob,
  originalBlob,
  thumbnailBlob,
}: CreatePhotoAssetFromConvexDocumentOptions): PhotoAsset {
  return {
    id: photo.id,
    name: photo.name,
    tags: photo.tags,
    originalName: photo.originalName,
    photoObject: photo.photoObject,
    blob,
    originalObject: photo.originalObject,
    originalBlob,
    thumbnailObject: photo.thumbnailObject,
    thumbnailBlob,
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
  };
}
