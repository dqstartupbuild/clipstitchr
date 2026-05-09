"use client";

import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

type AnalyzeUploadAssetOptions = {
  blob: Blob;
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
};

export async function analyzeUploadAsset({
  blob,
  mediaKind,
  originalName,
}: AnalyzeUploadAssetOptions): Promise<UploadAssetAnalysis> {
  const formData = new FormData();

  formData.set("file", blob, `${mediaKind}-preview.jpg`);
  formData.set("mediaKind", mediaKind);
  formData.set("originalName", originalName);

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
    name:
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : getUploadFallbackName(originalName),
    tags: Array.isArray(body.tags) ? normalizeAssetTags(body.tags) : [],
  };
}
