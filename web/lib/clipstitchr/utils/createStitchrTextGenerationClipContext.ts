import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getQuickEditOverlayText } from "@/lib/clipstitchr/utils/getQuickEditOverlayText";

export function createStitchrTextGenerationClipContext(
  clip: VideoClipMetadata,
): StitchrTextGenerationClipContext {
  const overlayText = getQuickEditOverlayText({
    performanceScore: clip.performanceScore,
    quickEdit: clip.quickEdit,
  });

  return {
    id: clip.id,
    libraryKind: clip.libraryKind,
    mainPersonDescription: clip.mainPersonDescription,
    name: clip.name,
    outfitDescription: clip.outfitDescription,
    locationDescription: clip.locationDescription,
    poseDescription: clip.poseDescription,
    productDescription: clip.productDescription,
    ...(overlayText ? { quickEditOverlayTextHint: overlayText.replaceWith } : {}),
    ...(overlayText?.reason
      ? { quickEditOverlayTextReason: overlayText.reason }
      : {}),
    role: clip.clipType === "demo" ? "demo" : "ugc",
    tags: clip.tags,
    videoDescription: clip.videoDescription,
  };
}
