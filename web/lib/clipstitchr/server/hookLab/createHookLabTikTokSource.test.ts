import { describe, expect, it } from "vitest";
import { createHookLabTikTokSource } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokSource";

describe("createHookLabTikTokSource", () => {
  it("normalizes a Clockworks-style item without requiring video media", () => {
    expect(
      createHookLabTikTokSource(
        {
          authorMeta: {
            name: "creator",
            nickName: "Creator Name",
            profileUrl: "https://www.tiktok.com/@creator",
          },
          createTime: 1_719_792_000,
          id: "7412345678901234567",
          commentCount: 210,
          diggCount: 12_400,
          mediaUrls: [],
          playCount: 340_000,
          shareCount: 970,
          collectCount: 2_800,
          text: "The hook text",
          videoMeta: { coverUrl: "https://cdn.example.com/cover.jpg" },
          webVideoUrl:
            "https://www.tiktok.com/@creator/video/7412345678901234567?lang=en",
        },
        "https://www.tiktok.com/@creator/video/7412345678901234567",
      ),
    ).toEqual({
      authorName: "Creator Name",
      authorProfileUrl: "https://www.tiktok.com/@creator",
      authorUsername: "creator",
      canonicalUrl: "https://www.tiktok.com/@creator/video/7412345678901234567",
      metrics: {
        commentCount: 210,
        likeCount: 12_400,
        playCount: 340_000,
        saveCount: 2_800,
        shareCount: 970,
      },
      platform: "tiktok",
      sourceCreatedAt: "2024-07-01T00:00:00.000Z",
      sourcePostId: "7412345678901234567",
      sourceText: "The hook text",
      temporaryVideoUrl: undefined,
      thumbnailUrl: "https://cdn.example.com/cover.jpg",
    });
  });

  it("uses a verified actor media URL when one is present", () => {
    expect(
      createHookLabTikTokSource(
        {
          id: "7412345678901234567",
          mediaUrls: ["https://cdn.example.com/video.mp4"],
        },
        "https://www.tiktok.com/@creator/video/7412345678901234567",
      ).temporaryVideoUrl,
    ).toBe("https://cdn.example.com/video.mp4");
  });
});
