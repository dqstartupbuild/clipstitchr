import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

export function createSwiprBackgroundAssetFromConvexDocument(
  background: Doc<"swiprBackgrounds"> & { isOwnedByCurrentUser?: boolean },
  blob?: Blob,
): SwiprBackgroundAsset {
  return {
    id: background.id,
    name: background.name,
    tags: background.tags,
    description: background.description,
    details: background.details,
    libraryQuery: background.libraryQuery,
    pexelsPhotoId: background.pexelsPhotoId,
    source: background.source,
    isOwnedByCurrentUser: background.isOwnedByCurrentUser,
    imageObject: background.imageObject,
    ...(blob ? { blob } : {}),
    mimeType: background.mimeType,
    size: background.size,
    width: background.width,
    height: background.height,
    createdAt: background.createdAt,
  };
}
