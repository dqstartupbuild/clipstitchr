import { analyzeUploadAsset } from "@/lib/clipstitchr/client/analyzeUploadAsset";
import { createR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createR2DownloadUrl";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { getUploadVideoAnalysisKind } from "@/lib/clipstitchr/utils/getUploadVideoAnalysisKind";

type AnalyzeNormalizedVideoUploadOptions = {
  clipType: ClipType;
  originalName: string;
  posterBlob: Blob;
  videoObject: R2ObjectReference;
};

export async function analyzeNormalizedVideoUpload({
  clipType,
  originalName,
  posterBlob,
  videoObject,
}: AnalyzeNormalizedVideoUploadOptions): Promise<UploadAssetAnalysis> {
  const downloadUrl = await createR2DownloadUrl(videoObject);

  return await analyzeUploadAsset({
    fallbackBlob: posterBlob,
    mediaKind: getUploadVideoAnalysisKind(clipType),
    originalName,
    sourceSizeBytes: videoObject.size,
    sourceUrl: downloadUrl.url,
  });
}
