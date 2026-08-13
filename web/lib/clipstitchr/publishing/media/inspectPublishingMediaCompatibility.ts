import type { PublishingMediaCompatibilityIssue } from "@/lib/clipstitchr/publishing/media/PublishingMediaCompatibilityIssue";
import type { PublishingMediaCompatibilityReport } from "@/lib/clipstitchr/publishing/media/PublishingMediaCompatibilityReport";
import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";

type InspectPublishingMediaCompatibilityOptions = {
  maxVideoDurationSeconds?: number;
};

const h264CodecNames = new Set(["avc", "avc1", "h264", "video/avc"]);
const aacCodecNames = new Set(["aac", "mp4a", "mp4a.40.2"]);

export function inspectPublishingMediaCompatibility(
  provider: PublishingMediaProvider,
  mediaObjects: readonly PublishingMediaObject[],
  options: InspectPublishingMediaCompatibilityOptions = {},
): PublishingMediaCompatibilityReport {
  const issues: PublishingMediaCompatibilityIssue[] = [];
  const imageCount = mediaObjects.filter((mediaObject) =>
    mediaObject.contentType.startsWith("image/"),
  ).length;
  const videoCount = mediaObjects.filter((mediaObject) =>
    mediaObject.contentType.startsWith("video/"),
  ).length;

  if (mediaObjects.length === 0) {
    issues.push({
      code: "media_required",
      message: `${provider === "instagram" ? "Instagram" : provider === "tiktok" ? "TikTok" : "YouTube"} needs at least one media item.`,
      severity: "error",
    });
  }

  if (provider === "instagram" && mediaObjects.length > 10) {
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

  if (
    provider === "youtube" &&
    (videoCount !== 1 || mediaObjects.length !== 1)
  ) {
    issues.push({
      code: "youtube_video_count",
      message: "YouTube needs exactly one saved video for each post.",
      severity: "error",
    });
  }

  mediaObjects.forEach((mediaObject, mediaIndex) => {
    const contentType = mediaObject.contentType
      .split(";", 1)[0]
      .trim()
      .toLowerCase();
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    const providerMimeTypes =
      provider === "instagram"
        ? new Set(["image/jpeg", "image/png", "video/mp4"])
        : provider === "tiktok"
          ? new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"])
          : new Set(["video/mp4"]);

    if (!providerMimeTypes.has(contentType)) {
      issues.push({
        code: `${provider}_content_type`,
        mediaIndex,
        message: `${provider === "instagram" ? "Instagram" : provider === "tiktok" ? "TikTok" : "YouTube"} does not accept ${contentType} through this publishing path.`,
        severity: "error",
      });
    }

    if (!mediaObject.width || !mediaObject.height) {
      issues.push({
        code: "dimensions_required",
        mediaIndex,
        message: "Width and height must be inspected before this media is published.",
        severity: "error",
      });
    }

    if (isVideo && !mediaObject.durationSeconds) {
      issues.push({
        code: "duration_required",
        mediaIndex,
        message: "Video duration must be inspected before this media is published.",
        severity: "error",
      });
    }

    if (
      isVideo &&
      options.maxVideoDurationSeconds !== undefined &&
      mediaObject.durationSeconds !== undefined &&
      mediaObject.durationSeconds > options.maxVideoDurationSeconds
    ) {
      issues.push({
        code: `${provider}_duration_limit`,
        mediaIndex,
        message: `This video is longer than the connected ${provider === "instagram" ? "Instagram" : "TikTok"} account currently allows.`,
        severity: "error",
      });
    }

    if (isVideo && !mediaObject.videoCodec) {
      issues.push({
        code: "video_codec_unknown",
        mediaIndex,
        message: "Confirm the video codec before publishing. H.264 is the safest shared format.",
        severity: "warning",
      });
    }

    if (
      isVideo &&
      mediaObject.videoCodec &&
      !h264CodecNames.has(mediaObject.videoCodec.toLowerCase())
    ) {
      issues.push({
        code: "video_codec_incompatible",
        mediaIndex,
        message: "This publishing path expects H.264 video.",
        severity: "error",
      });
    }

    if (isVideo && mediaObject.hasAudio && !mediaObject.audioCodec) {
      issues.push({
        code: "audio_codec_unknown",
        mediaIndex,
        message: "Confirm the audio codec before publishing. AAC is the safest shared format.",
        severity: "warning",
      });
    }

    if (
      isVideo &&
      mediaObject.hasAudio &&
      mediaObject.audioCodec &&
      !aacCodecNames.has(mediaObject.audioCodec.toLowerCase())
    ) {
      issues.push({
        code: "audio_codec_incompatible",
        mediaIndex,
        message: "This publishing path expects AAC audio when audio is present.",
        severity: "error",
      });
    }

    if (
      provider === "tiktok" &&
      isVideo &&
      mediaObject.width &&
      mediaObject.height &&
      mediaObject.width > mediaObject.height
    ) {
      issues.push({
        code: "tiktok_landscape_video",
        mediaIndex,
        message: "TikTok may accept this landscape video, but a vertical export is a safer fit.",
        severity: "warning",
      });
    }

    if (!isImage && !isVideo) {
      issues.push({
        code: "unsupported_media_kind",
        mediaIndex,
        message: "Only images and videos can be published.",
        severity: "error",
      });
    }
  });

  const hasErrors = issues.some((issue) => issue.severity === "error");
  const hasWarnings = issues.some((issue) => issue.severity === "warning");

  return Object.freeze({
    issues: Object.freeze(issues),
    provider,
    providerAcceptanceStillRequired: true,
    status: hasErrors
      ? "metadata-incompatible"
      : hasWarnings
        ? "metadata-ready-with-warnings"
        : "metadata-ready",
  });
}
