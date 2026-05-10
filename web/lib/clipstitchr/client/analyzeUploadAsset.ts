"use client";

import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";
import { getBlobFileExtension } from "@/lib/clipstitchr/utils/getBlobFileExtension";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

type AnalyzeUploadAssetOptions = {
  blob?: Blob;
  fallbackBlob?: Blob;
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
  sourceSizeBytes?: number;
  sourceUrl?: string;
};

export async function analyzeUploadAsset({
  blob,
  fallbackBlob,
  mediaKind,
  originalName,
  sourceSizeBytes,
  sourceUrl,
}: AnalyzeUploadAssetOptions): Promise<UploadAssetAnalysis> {
  const formData = new FormData();

  if (blob) {
    const fileExtension = getBlobFileExtension(
      blob,
      mediaKind === "photo" ? "jpg" : "mp4",
    );

    formData.set("file", blob, `${mediaKind}-source.${fileExtension}`);
  }

  if (fallbackBlob) {
    formData.set("fallbackImage", fallbackBlob, `${mediaKind}-fallback.jpg`);
  }

  formData.set("mediaKind", mediaKind);
  formData.set("originalName", originalName);

  if (sourceUrl) {
    formData.set("sourceUrl", sourceUrl);
  }

  if (sourceSizeBytes !== undefined) {
    formData.set("sourceSizeBytes", String(sourceSizeBytes));
  }

  const response = await fetch("/api/uploads/analyze", {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as Partial<UploadAssetAnalysis> & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to analyze this upload.");
  }

  return {
    avatarDescription:
      typeof body.avatarDescription === "string"
        ? body.avatarDescription.trim()
        : undefined,
    mainPersonDescription:
      typeof body.mainPersonDescription === "string"
        ? body.mainPersonDescription.trim()
        : undefined,
    outfitDescription:
      typeof body.outfitDescription === "string"
        ? body.outfitDescription.trim()
        : undefined,
    locationDescription:
      typeof body.locationDescription === "string"
        ? body.locationDescription.trim()
        : undefined,
    poseDescription:
      typeof body.poseDescription === "string"
        ? body.poseDescription.trim()
        : undefined,
    productDescription:
      typeof body.productDescription === "string"
        ? body.productDescription.trim()
        : undefined,
    videoDescription:
      typeof body.videoDescription === "string"
        ? body.videoDescription.trim()
        : undefined,
    name:
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : getUploadFallbackName(originalName),
    tags: Array.isArray(body.tags) ? normalizeAssetTags(body.tags) : [],
  };
}
