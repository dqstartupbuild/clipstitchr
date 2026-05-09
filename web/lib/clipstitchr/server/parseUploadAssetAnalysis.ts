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
      mainPersonDescription?: unknown;
      outfitDescription?: unknown;
      locationDescription?: unknown;
      poseDescription?: unknown;
      productDescription?: unknown;
      videoDescription?: unknown;
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
    const rawMainPersonDescription =
      typeof parsed.mainPersonDescription === "string"
        ? parsed.mainPersonDescription.trim().slice(0, 1200)
        : undefined;
    const mainPersonDescriptionParts = splitAvatarDescriptionPoseDetails(
      rawMainPersonDescription ?? "",
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
      parsedPoseDescription ||
      mainPersonDescriptionParts.poseDescription ||
      avatarDescriptionParts.poseDescription;
    const productDescription =
      typeof parsed.productDescription === "string"
        ? parsed.productDescription.trim().slice(0, 1200)
        : undefined;
    const videoDescription =
      typeof parsed.videoDescription === "string"
        ? parsed.videoDescription.trim().slice(0, 1600)
        : undefined;
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
      ...(mainPersonDescriptionParts.avatarDescription
        ? {
            mainPersonDescription:
              mainPersonDescriptionParts.avatarDescription,
          }
        : {}),
      ...(outfitDescription ? { outfitDescription } : {}),
      ...(locationDescription ? { locationDescription } : {}),
      ...(poseDescription ? { poseDescription } : {}),
      ...(productDescription ? { productDescription } : {}),
      ...(videoDescription ? { videoDescription } : {}),
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
