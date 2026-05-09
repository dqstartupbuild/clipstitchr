import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function getUploadAnalysisKind(value: string): UploadAssetAnalysisKind {
  if (value === "demo-video" || value === "photo" || value === "ugc-video") {
    return value;
  }

  return "video";
}
