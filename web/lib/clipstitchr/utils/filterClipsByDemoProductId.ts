import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterClipsByDemoProductId(
  clips: VideoClipMetadata[],
  productFilterId: string,
) {
  const normalizedProductFilterId = productFilterId.trim();

  if (!normalizedProductFilterId || normalizedProductFilterId === "all") {
    return clips;
  }

  return clips.filter(
    (clip) =>
      clip.clipType !== "demo" || clip.productId === normalizedProductFilterId,
  );
}
