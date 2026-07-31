import type { Infer } from "convex/values";
import { socialPostAssetInputValidator } from "../validators/socialPostAssetInput";
import type { SocialPlatform } from "../../lib/clipstitchr/social/types/SocialPlatform";
import { getMaxSocialAssetBytes } from "../../lib/clipstitchr/social/getMaxSocialAssetBytes";
import { getMaxSocialPostBytes } from "../../lib/clipstitchr/social/getMaxSocialPostBytes";

type SocialPostAssetInput = Infer<typeof socialPostAssetInputValidator>;

export function validateSocialPostAssets(
  assets: SocialPostAssetInput[],
  platforms: SocialPlatform[],
) {
  if (assets.length < 1 || assets.length > 35) {
    throw new Error("Choose between 1 and 35 photos, or one video.");
  }

  const kind = assets[0].kind;

  if (assets.some((asset) => asset.kind !== kind)) {
    throw new Error("Use photos or a video in one post, not both.");
  }

  if (kind === "video" && assets.length !== 1) {
    throw new Error("A social video post can contain one video.");
  }

  if (
    kind === "image" &&
    platforms.includes("instagram") &&
    assets.length > 10
  ) {
    throw new Error("Instagram carousels can contain up to 10 photos.");
  }

  const orders = new Set<number>();
  const ids = new Set<string>();
  const maxAssetBytes = getMaxSocialAssetBytes();
  const maxPostBytes = getMaxSocialPostBytes();
  const totalBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

  if (!Number.isFinite(totalBytes) || totalBytes > maxPostBytes) {
    throw new Error("This post's media is too large to schedule safely.");
  }

  for (const asset of assets) {
    if (
      !Number.isInteger(asset.order) ||
      asset.order < 0 ||
      !Number.isFinite(asset.sizeBytes) ||
      asset.sizeBytes <= 0
    ) {
      throw new Error("Social post media details are invalid.");
    }

    if (asset.sizeBytes > maxAssetBytes) {
      throw new Error("One media file is too large to schedule safely.");
    }

    if (
      platforms.includes("instagram") &&
      asset.kind === "image" &&
      asset.sizeBytes > 8 * 1024 * 1024
    ) {
      throw new Error("Instagram photos must be 8 MB or smaller.");
    }

    if (
      platforms.includes("instagram") &&
      asset.kind === "video" &&
      asset.sizeBytes > 300 * 1024 * 1024
    ) {
      throw new Error("Instagram videos must be 300 MB or smaller.");
    }

    if (asset.kind === "image") {
      if (
        !Number.isFinite(asset.width) ||
        !Number.isFinite(asset.height) ||
        asset.width! <= 0 ||
        asset.height! <= 0
      ) {
        throw new Error("Photo dimensions are missing.");
      }

      if (
        platforms.includes("tiktok") &&
        asset.contentType !== "image/jpeg" &&
        asset.contentType !== "image/webp"
      ) {
        throw new Error("TikTok photos must be JPEG or WebP files.");
      }

      if (platforms.includes("tiktok") && asset.sizeBytes > 20 * 1024 * 1024) {
        throw new Error("TikTok photos must be 20 MB or smaller.");
      }

      const aspectRatio = asset.width! / asset.height!;

      if (
        platforms.includes("instagram") &&
        (aspectRatio < 4 / 5 || aspectRatio > 1.91)
      ) {
        throw new Error(
          "Instagram photos must be between portrait 4:5 and landscape 1.91:1.",
        );
      }
    }

    if (asset.kind === "video") {
      if (
        !Number.isFinite(asset.width) ||
        !Number.isFinite(asset.height) ||
        !Number.isFinite(asset.durationSeconds) ||
        asset.width! <= 0 ||
        asset.height! <= 0 ||
        asset.durationSeconds! <= 0
      ) {
        throw new Error("Video dimensions or duration are missing.");
      }

      if (
        platforms.includes("instagram") &&
        asset.contentType !== "video/mp4" &&
        asset.contentType !== "video/quicktime"
      ) {
        throw new Error("Instagram Reels must be MP4 or MOV files.");
      }

      if (
        platforms.includes("instagram") &&
        (asset.durationSeconds! < 3 || asset.durationSeconds! > 15 * 60)
      ) {
        throw new Error(
          "Instagram Reels must be between 3 seconds and 15 minutes.",
        );
      }

      if (platforms.includes("instagram") && asset.width! > 1_920) {
        throw new Error("Instagram Reels can be up to 1,920 pixels wide.");
      }

      if (
        platforms.includes("tiktok") &&
        !["video/mp4", "video/quicktime", "video/webm"].includes(
          asset.contentType,
        )
      ) {
        throw new Error("TikTok videos must be MP4, MOV, or WebM files.");
      }

      if (
        platforms.includes("tiktok") &&
        (asset.width! < 360 ||
          asset.width! > 4_096 ||
          asset.height! < 360 ||
          asset.height! > 4_096 ||
          asset.durationSeconds! > 10 * 60)
      ) {
        throw new Error(
          "This video is outside TikTok's supported size or duration.",
        );
      }
    }

    if (orders.has(asset.order) || ids.has(asset.id)) {
      throw new Error("Each social post media item must be unique.");
    }

    if (
      (asset.kind === "video" && !asset.contentType.startsWith("video/")) ||
      (asset.kind === "image" && !asset.contentType.startsWith("image/"))
    ) {
      throw new Error("A social post media type does not match its file.");
    }

    orders.add(asset.order);
    ids.add(asset.id);
  }
}
