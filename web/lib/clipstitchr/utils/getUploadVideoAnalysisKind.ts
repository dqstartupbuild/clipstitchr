import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function getUploadVideoAnalysisKind(
  clipType: ClipType,
): UploadAssetAnalysisKind {
  return clipType === "demo" ? "demo-video" : "ugc-video";
}
