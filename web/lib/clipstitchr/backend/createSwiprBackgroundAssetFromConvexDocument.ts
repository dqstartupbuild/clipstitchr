import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

export function createSwiprBackgroundAssetFromConvexDocument(
  background: (Doc<"swiprBackgrounds"> | Doc<"swiprBackgroundCards">) & {
    isOwnedByCurrentUser?: boolean;
  },
  blob?: Blob,
): SwiprBackgroundAsset {
  return {
    id: background.id,
    name: background.name,
    searchText: "searchText" in background ? background.searchText : undefined,
    tags: background.tags,
    description: background.description,
    details: "details" in background ? background.details : undefined,
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
