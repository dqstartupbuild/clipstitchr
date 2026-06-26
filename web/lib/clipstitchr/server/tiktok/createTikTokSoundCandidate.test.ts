import { describe, expect, it } from "vitest";
import { createTikTokSoundCandidate } from "@/lib/clipstitchr/server/tiktok/createTikTokSoundCandidate";

describe("createTikTokSoundCandidate", () => {
  it("uses music metadata and mediaUrls for importable sound candidates", () => {
    expect(
      createTikTokSoundCandidate({
        mediaUrls: ["https://api.apify.com/v2/key-value-stores/video.mp4"],
        musicMeta: {
          musicAuthor: "Creator",
          musicId: "music_1",
          musicName: "Trend hook",
        },
        playCount: 1234,
        text: "Best opening clip",
        videoMeta: {
          duration: 14,
        },
        webVideoUrl: "https://www.tiktok.com/@creator/video/1",
      }),
    ).toEqual({
      author: "Creator",
      coverUrl: undefined,
      durationSeconds: 14,
      musicId: "music_1",
      playCount: 1234,
      playUrl: "https://api.apify.com/v2/key-value-stores/video.mp4",
      sourceUrl: "https://www.tiktok.com/@creator/video/1",
      title: "Trend hook",
      videoText: "Best opening clip",
    });
  });

  it("returns null when the TikTok source URL is missing", () => {
    expect(createTikTokSoundCandidate({ musicMeta: { musicName: "No URL" } }))
      .toBeNull();
  });

  it("returns null for Apify error rows", () => {
    expect(
      createTikTokSoundCandidate({
        error: "Video not found",
        url: "https://www.tiktok.com/@creator/video/missing",
      }),
    ).toBeNull();
  });
});
