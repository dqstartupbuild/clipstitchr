import { describe, expect, it } from "vitest";
import { inspectPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/media/inspectPublishingMediaCompatibility";
import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";

const verticalVideo: PublishingMediaObject = {
  audioCodec: "aac",
  checksum: "sha256:video",
  contentType: "video/mp4",
  durationSeconds: 18,
  hasAudio: true,
  height: 1920,
  objectKey: "users/user_123/stitches/stitch_123/video.mp4",
  sizeBytes: 9_000_000,
  videoCodec: "h264",
  width: 1080,
};

const portraitImage: PublishingMediaObject = {
  checksum: "sha256:image",
  contentType: "image/jpeg",
  height: 1350,
  objectKey: "users/user_123/swipes/swipe_123/slide-1.jpg",
  sizeBytes: 700_000,
  width: 1080,
};

describe("inspectPublishingMediaCompatibility", () => {
  it("reports metadata readiness without claiming provider acceptance", () => {
    expect(
      inspectPublishingMediaCompatibility("instagram", [verticalVideo]),
    ).toEqual({
      issues: [],
      provider: "instagram",
      providerAcceptanceStillRequired: true,
      status: "metadata-ready",
    });
  });

  it("reports Instagram's carousel limit separately", () => {
    const report = inspectPublishingMediaCompatibility(
      "instagram",
      Array.from({ length: 11 }, (_, mediaIndex) => ({
        ...portraitImage,
        objectKey: `users/user_123/swipes/swipe_123/slide-${mediaIndex + 1}.jpg`,
      })),
    );

    expect(report.status).toBe("metadata-incompatible");
    expect(report.issues).toContainEqual(
      expect.objectContaining({ code: "instagram_attachment_limit" }),
    );
  });

  it("reports TikTok's no-mixed-media rule separately", () => {
    const report = inspectPublishingMediaCompatibility("tiktok", [
      portraitImage,
      verticalVideo,
    ]);

    expect(report.status).toBe("metadata-incompatible");
    expect(report.issues).toContainEqual(
      expect.objectContaining({ code: "tiktok_mixed_media" }),
    );
  });

  it("requires exactly one MP4 video for YouTube", () => {
    expect(
      inspectPublishingMediaCompatibility("youtube", [verticalVideo]),
    ).toMatchObject({
      issues: [],
      provider: "youtube",
      status: "metadata-ready",
    });

    const imageReport = inspectPublishingMediaCompatibility("youtube", [
      portraitImage,
    ]);
    expect(imageReport.status).toBe("metadata-incompatible");
    expect(imageReport.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["youtube_video_count", "youtube_content_type"]),
    );

    const multiVideoReport = inspectPublishingMediaCompatibility("youtube", [
      verticalVideo,
      { ...verticalVideo, objectKey: `${verticalVideo.objectKey}.second` },
    ]);
    expect(multiVideoReport.issues).toContainEqual(
      expect.objectContaining({ code: "youtube_video_count" }),
    );
  });

  it("reports known incompatible codecs and account-specific duration", () => {
    const report = inspectPublishingMediaCompatibility(
      "tiktok",
      [
        {
          ...verticalVideo,
          audioCodec: "opus",
          durationSeconds: 90,
          videoCodec: "vp9",
        },
      ],
      { maxVideoDurationSeconds: 60 },
    );

    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "tiktok_duration_limit",
        "video_codec_incompatible",
        "audio_codec_incompatible",
      ]),
    );
  });

  it("keeps uncertain metadata as warnings instead of approval", () => {
    const report = inspectPublishingMediaCompatibility("tiktok", [
      {
        ...verticalVideo,
        audioCodec: undefined,
        videoCodec: undefined,
      },
    ]);

    expect(report.status).toBe("metadata-ready-with-warnings");
    expect(report.providerAcceptanceStillRequired).toBe(true);
  });
});
