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
      mediaKind: "video",
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
      temporaryImageUrls: undefined,
      temporaryVideoUrl: undefined,
      thumbnailUrl: "https://cdn.example.com/cover.jpg",
    });
  });

  it("returns downloaded slideshow images for a photo post", () => {
    const source = createHookLabTikTokSource(
      {
        id: "7412345678901234567",
        isSlideshow: true,
        slideshowImageLinks: [
          {
            downloadLink: "https://cdn.example.com/slide-1.jpg",
            tiktokLink: "https://tiktok.example.com/slide-1.jpg",
          },
          {
            downloadLink: "https://cdn.example.com/slide-2.jpg",
            tiktokLink: "https://tiktok.example.com/slide-2.jpg",
          },
        ],
        videoUrl: "https://cdn.example.com/not-the-slideshow.mp4",
        webVideoUrl:
          "https://www.tiktok.com/@creator/photo/7412345678901234567",
      },
      "https://www.tiktok.com/@creator/photo/7412345678901234567",
    );

    expect(source.mediaKind).toBe("slideshow");
    expect(source.temporaryImageUrls).toEqual([
      "https://cdn.example.com/slide-1.jpg",
      "https://cdn.example.com/slide-2.jpg",
    ]);
    expect(source.temporaryVideoUrl).toBeUndefined();
  });

  it("falls back to TikTok image links when downloads are unavailable", () => {
    const source = createHookLabTikTokSource(
      {
        slideshowImageLinks: [
          { tiktokLink: "https://tiktok.example.com/slide-1.jpg" },
        ],
      },
      "https://www.tiktok.com/@creator/photo/7412345678901234567",
    );

    expect(source.temporaryImageUrls).toEqual([
      "https://tiktok.example.com/slide-1.jpg",
    ]);
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
