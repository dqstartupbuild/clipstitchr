import { describe, expect, it } from "vitest";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { createSharedMusicR2ObjectKey } from "@/lib/clipstitchr/server/r2/createSharedMusicR2ObjectKey";

describe("createR2ObjectKey", () => {
  it("creates deterministic user-scoped keys for clip videos", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "video-clip-video",
        recordId: "clip_456",
        contentType: "video/mp4",
      }),
    ).toBe("users/user_123/video-clips/clip_456/video.mp4");
  });

  it("sanitizes record ID path segments", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "photo-thumbnail",
        recordId: "../unsafe photo id",
        contentType: "image/jpeg",
      }),
    ).toBe("users/user_123/photos/unsafe-photo-id/thumbnail.jpg");
  });

  it("creates user-scoped keys for Clipr music", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "clipr-music-audio",
        recordId: "job_456",
        contentType: "audio/mpeg",
      }),
    ).toBe("users/user_123/clipr-music/job_456/music.mp3");
  });

  it("creates user-scoped keys for personal library music", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "library-music-audio",
        recordId: "track_456",
        contentType: "audio/mpeg",
      }),
    ).toBe("users/user_123/library-music/track_456/music.mp3");
  });

  it("creates user-scoped keys for stitch music", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "stitch-music-audio",
        recordId: "stitch_456",
        contentType: "audio/mpeg",
      }),
    ).toBe("users/user_123/stitch-music/stitch_456/music.mp3");
  });

  it("creates user-scoped keys for temporary Swapr segments", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "swapr-segment-video",
        recordId: "clip_456-segment_1",
        contentType: "video/mp4",
      }),
    ).toBe("users/user_123/swapr-segments/clip_456-segment_1/segment.mp4");
  });

  it("creates user-scoped keys for Swipe posters", () => {
    expect(
      createR2ObjectKey({
        userId: "user_123",
        kind: "swipe-poster",
        recordId: "swipe_456",
        contentType: "image/png",
      }),
    ).toBe("users/user_123/swipes/swipe_456/poster.png");
  });
});

describe("createSharedMusicR2ObjectKey", () => {
  it("creates deterministic shared music keys", () => {
    expect(
      createSharedMusicR2ObjectKey({
        recordId: "track_456",
        contentType: "audio/mpeg",
      }),
    ).toBe("shared/music/track_456/audio.mp3");
  });
});

describe("assertR2ObjectKeyBelongsToUser", () => {
  it("allows keys inside the authenticated user prefix", () => {
    expect(() =>
      assertR2ObjectKeyBelongsToUser(
        "users/user_123/stitches/stitch_456/video.mp4",
        "user_123",
      ),
    ).not.toThrow();
  });

  it("rejects keys outside the authenticated user prefix", () => {
    expect(() =>
      assertR2ObjectKeyBelongsToUser(
        "users/user_other/stitches/stitch_456/video.mp4",
        "user_123",
      ),
    ).toThrow("outside the authenticated user scope");
  });
});
