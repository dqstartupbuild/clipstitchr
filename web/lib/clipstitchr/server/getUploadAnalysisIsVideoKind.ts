import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function getUploadAnalysisIsVideoKind(
  mediaKind: UploadAssetAnalysisKind,
) {
  return (
    mediaKind === "demo-video" ||
    mediaKind === "ugc-video" ||
    mediaKind === "video"
  );
}
