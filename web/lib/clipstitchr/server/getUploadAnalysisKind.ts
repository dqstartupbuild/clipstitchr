import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function getUploadAnalysisKind(value: string): UploadAssetAnalysisKind {
  return value === "photo" ? "photo" : "video";
}
