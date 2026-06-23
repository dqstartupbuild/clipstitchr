import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import type { ClipMetadata } from "@/lib/clipstitchr/types/ClipMetadata";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type CreateBrowserUploadVideoClipSaveArgsOptions = {
  analysis: UploadAssetAnalysis;
  clipId: string;
  clipType: ClipType;
  metadata: ClipMetadata;
  mimeType: string;
  originalName: string;
  originalSize: number;
  posterObject: R2ObjectReference;
  productId?: string;
  sourceMimeType: string;
  updatedAt: string;
  videoObject: R2ObjectReference;
};

export function createBrowserUploadVideoClipSaveArgs({
  analysis,
  clipId,
  clipType,
  metadata,
  mimeType,
  originalName,
  originalSize,
  posterObject,
  productId,
  sourceMimeType,
  updatedAt,
  videoObject,
}: CreateBrowserUploadVideoClipSaveArgsOptions) {
  return {
    id: clipId,
    name: analysis.name || getUploadFallbackName(originalName),
    tags: normalizeAssetTagsWithRequiredTag(analysis.tags, clipType),
    videoDescription: analysis.videoDescription,
    mainPersonDescription: analysis.mainPersonDescription,
    outfitDescription: analysis.outfitDescription,
    locationDescription: analysis.locationDescription,
    poseDescription: analysis.poseDescription,
    performanceScore: analysis.performanceScore,
    productDescription: analysis.productDescription,
    productId,
    originalName,
    clipType,
    videoObject,
    posterObject,
    posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
    mimeType,
    sourceMimeType,
    size: videoObject.size,
    originalSize,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.aspectRatio,
    duration: metadata.duration,
    defaultTrimRange: {
      start: 0,
      end: metadata.duration,
    },
    hasAudio: metadata.hasAudio,
    createdAt: updatedAt,
    updatedAt,
  };
}
