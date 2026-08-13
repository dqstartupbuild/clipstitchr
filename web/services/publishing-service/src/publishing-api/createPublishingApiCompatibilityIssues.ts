import type { PublishingMediaObject } from "../persistence/PublishingMediaObject.js";
import type { PublishingApiCompatibilityIssue } from "./PublishingApiCompatibilityIssue.js";

const H264_CODECS = new Set(["avc", "avc1", "h264", "video/avc"]);
const AAC_CODECS = new Set(["aac", "mp4a", "mp4a.40.2"]);

export const createPublishingApiCompatibilityIssues = (
  provider: "instagram" | "tiktok" | "youtube",
  objects: readonly PublishingMediaObject[],
): readonly PublishingApiCompatibilityIssue[] => {
  const issues: PublishingApiCompatibilityIssue[] = [];
  const imageCount = objects.filter(({ contentType }) =>
    contentType.toLowerCase().startsWith("image/"),
  ).length;
  const videoCount = objects.filter(({ contentType }) =>
    contentType.toLowerCase().startsWith("video/"),
  ).length;

  if (provider === "instagram" && objects.length > 10) {
    issues.push({
      code: "instagram_attachment_limit",
      message: "Instagram accepts at most 10 items in one carousel.",
      severity: "error",
    });
  }
  if (provider === "tiktok" && imageCount > 0 && videoCount > 0) {
    issues.push({
      code: "tiktok_mixed_media",
      message: "TikTok posts cannot mix photos and videos in one post.",
      severity: "error",
    });
  }
  if (provider === "tiktok" && videoCount > 1) {
    issues.push({
      code: "tiktok_video_count",
      message: "TikTok accepts one video per post.",
      severity: "error",
    });
  }
  if (provider === "youtube" && (objects.length !== 1 || videoCount !== 1)) {
    issues.push({
      code: "youtube_video_count",
      message: "YouTube accepts exactly one video in this publishing path.",
      severity: "error",
    });
  }

  objects.forEach((object) => {
    const contentType = object.contentType.split(";", 1)[0]!.trim().toLowerCase();
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    const accepted = provider === "instagram"
      ? new Set(["image/jpeg", "image/png", "video/mp4"])
      : provider === "youtube"
        ? new Set(["video/mp4"])
        : new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);

    if (!accepted.has(contentType)) {
      issues.push({
        code: `${provider}_content_type`,
        message: `${provider === "instagram" ? "Instagram" : provider === "youtube" ? "YouTube" : "TikTok"} does not accept this file type through this publishing path.`,
        severity: "error",
      });
    }
    if (object.width === undefined || object.height === undefined) {
      issues.push({
        code: "dimensions_required",
        message: "Width and height must be checked before this media is published.",
        severity: "error",
      });
    }
    if (isVideo && object.durationSeconds === undefined) {
      issues.push({
        code: "duration_required",
        message: "Video duration must be checked before this media is published.",
        severity: "error",
      });
    }
    if (isVideo && object.videoCodec === undefined) {
      issues.push({
        code: "video_codec_unknown",
        message: "Confirm the video codec before publishing. H.264 is the safest shared format.",
        severity: "warning",
      });
    } else if (
      isVideo &&
      object.videoCodec !== undefined &&
      !H264_CODECS.has(object.videoCodec.toLowerCase())
    ) {
      issues.push({
        code: "video_codec_incompatible",
        message: "This publishing path expects H.264 video.",
        severity: "error",
      });
    }
    if (isVideo && object.hasAudio === true && object.audioCodec === undefined) {
      issues.push({
        code: "audio_codec_unknown",
        message: "Confirm the audio codec before publishing. AAC is the safest shared format.",
        severity: "warning",
      });
    } else if (
      isVideo &&
      object.hasAudio === true &&
      object.audioCodec !== undefined &&
      !AAC_CODECS.has(object.audioCodec.toLowerCase())
    ) {
      issues.push({
        code: "audio_codec_incompatible",
        message: "This publishing path expects AAC audio when audio is present.",
        severity: "error",
      });
    }
    if (
      provider === "tiktok" &&
      isVideo &&
      object.width !== undefined &&
      object.height !== undefined &&
      object.width > object.height
    ) {
      issues.push({
        code: "tiktok_landscape_video",
        message: "TikTok may accept this landscape video, but a vertical export is a safer fit.",
        severity: "warning",
      });
    }
    if (!isImage && !isVideo) {
      issues.push({
        code: "unsupported_media_kind",
        message: "Only images and videos can be published.",
        severity: "error",
      });
    }
  });

  return Object.freeze(issues.slice(0, 50));
};
