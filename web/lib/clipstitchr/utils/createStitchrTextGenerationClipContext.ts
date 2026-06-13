import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createStitchrTextGenerationClipContext(
  clip: VideoClipMetadata,
): StitchrTextGenerationClipContext {
  return {
    id: clip.id,
    libraryKind: clip.libraryKind,
    mainPersonDescription: clip.mainPersonDescription,
    name: clip.name,
    outfitDescription: clip.outfitDescription,
    locationDescription: clip.locationDescription,
    poseDescription: clip.poseDescription,
    productDescription: clip.productDescription,
    role: clip.clipType === "demo" ? "demo" : "ugc",
    tags: clip.tags,
    videoDescription: clip.videoDescription,
  };
}
