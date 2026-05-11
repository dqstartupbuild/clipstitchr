"use client";

import type { SwiprBackgroundAnalysis } from "@/lib/clipstitchr/types/SwiprBackgroundAnalysis";
import { getBlobFileExtension } from "@/lib/clipstitchr/utils/getBlobFileExtension";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

type AnalyzeSwiprBackgroundOptions = {
  blob: Blob;
  originalName: string;
};

export async function analyzeSwiprBackground({
  blob,
  originalName,
}: AnalyzeSwiprBackgroundOptions): Promise<SwiprBackgroundAnalysis> {
  const formData = new FormData();
  const fileExtension = getBlobFileExtension(blob, "jpg");

  formData.set("file", blob, `swipr-background.${fileExtension}`);
  formData.set("originalName", originalName);

  const response = await fetch("/api/swipr/backgrounds/analyze", {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as Partial<SwiprBackgroundAnalysis> & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to analyze this background.");
  }

  return {
    name:
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : getUploadFallbackName(originalName),
    tags: Array.isArray(body.tags) ? normalizeAssetTags(body.tags) : [],
    description:
      typeof body.description === "string" ? body.description.trim() : undefined,
    details: typeof body.details === "string" ? body.details.trim() : undefined,
  };
}
