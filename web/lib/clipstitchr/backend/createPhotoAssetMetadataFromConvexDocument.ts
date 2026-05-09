import type { Doc } from "@/convex/_generated/dataModel";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export function createPhotoAssetMetadataFromConvexDocument(
  photo: Doc<"photoAssets">,
  thumbnailBlob?: Blob,
): PhotoAssetMetadata {
  return {
    id: photo.id,
    avatarId: photo.avatarId,
    name: photo.name,
    tags: photo.tags,
    avatarDescription: photo.avatarDescription,
    outfitDescription: photo.outfitDescription,
    locationDescription: photo.locationDescription,
    originalName: photo.originalName,
    photoObject: photo.photoObject,
    originalObject: photo.originalObject,
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
