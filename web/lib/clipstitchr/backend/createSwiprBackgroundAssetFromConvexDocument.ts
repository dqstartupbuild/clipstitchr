import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

export function createSwiprBackgroundAssetFromConvexDocument(
  background: Doc<"swiprBackgrounds">,
  blob: Blob,
): SwiprBackgroundAsset {
  return {
    id: background.id,
    name: background.name,
    tags: background.tags,
    description: background.description,
    details: background.details,
    source: background.source,
    imageObject: background.imageObject,
    blob,
    mimeType: background.mimeType,
    size: background.size,
    width: background.width,
    height: background.height,
    createdAt: background.createdAt,
  };
}
