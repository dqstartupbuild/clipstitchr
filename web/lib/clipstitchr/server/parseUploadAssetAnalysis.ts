import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { splitAvatarDescriptionPoseDetails } from "@/lib/clipstitchr/server/splitAvatarDescriptionPoseDetails";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

export function parseUploadAssetAnalysis(
  text: string,
  originalName: string,
): UploadAssetAnalysis {
  const fallbackName = getUploadFallbackName(originalName);
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? "";

  if (!jsonText) {
    return {
      name: fallbackName,
      tags: [],
    };
  }

  try {
    const parsed = JSON.parse(jsonText) as {
      avatarDescription?: unknown;
      outfitDescription?: unknown;
      locationDescription?: unknown;
      poseDescription?: unknown;
      name?: unknown;
      tags?: unknown;
    };
    const rawAvatarDescription =
      typeof parsed.avatarDescription === "string"
        ? parsed.avatarDescription.trim().slice(0, 1200)
        : undefined;
    const avatarDescriptionParts = splitAvatarDescriptionPoseDetails(
      rawAvatarDescription ?? "",
    );
    const outfitDescription =
      typeof parsed.outfitDescription === "string"
        ? parsed.outfitDescription.trim().slice(0, 800)
        : undefined;
    const locationDescription =
      typeof parsed.locationDescription === "string"
        ? parsed.locationDescription.trim().slice(0, 800)
        : undefined;
    const parsedPoseDescription =
      typeof parsed.poseDescription === "string"
        ? parsed.poseDescription.trim().slice(0, 800)
        : undefined;
    const poseDescription =
      parsedPoseDescription || avatarDescriptionParts.poseDescription;
    const name =
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim().slice(0, 80)
        : fallbackName;
    const tags = Array.isArray(parsed.tags)
      ? normalizeAssetTags(
          parsed.tags.filter((tag): tag is string => typeof tag === "string"),
        )
      : [];

    return {
      ...(avatarDescriptionParts.avatarDescription
        ? { avatarDescription: avatarDescriptionParts.avatarDescription }
        : {}),
      ...(outfitDescription ? { outfitDescription } : {}),
      ...(locationDescription ? { locationDescription } : {}),
      ...(poseDescription ? { poseDescription } : {}),
      name,
      tags,
    };
  } catch {
    return {
      name: fallbackName,
      tags: [],
    };
  }
}
