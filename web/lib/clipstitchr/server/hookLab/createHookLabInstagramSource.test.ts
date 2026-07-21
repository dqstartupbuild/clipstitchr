import { describe, expect, it } from "vitest";
import { createHookLabInstagramSource } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramSource";

describe("createHookLabInstagramSource", () => {
  it("normalizes an Instagram Scraper video item", () => {
    expect(
      createHookLabInstagramSource(
        {
          caption: "A useful opening",
          commentsCount: 84,
          displayUrl: "https://cdn.example.com/cover.jpg",
          id: "post_123",
          ownerFullName: "Creator Name",
          ownerUsername: "creator",
          likesCount: 5_600,
          productType: "clips",
          videoPlayCount: 120_000,
          timestamp: "2026-07-01T12:30:00.000Z",
          url: "https://www.instagram.com/reel/ABC123/?utm_source=ig_web",
          videoUrl: "https://cdn.example.com/video.mp4",
        },
        "https://www.instagram.com/reel/ABC123/",
      ),
    ).toEqual({
      authorName: "Creator Name",
      authorProfileUrl: undefined,
      authorUsername: "creator",
      canonicalUrl: "https://www.instagram.com/reel/ABC123/",
      mediaKind: "video",
      metrics: {
        commentCount: 84,
        likeCount: 5_600,
        playCount: 120_000,
        saveCount: undefined,
        shareCount: undefined,
      },
      platform: "instagram",
      sourceCreatedAt: "2026-07-01T12:30:00.000Z",
      sourcePostId: "post_123",
      sourceText: "A useful opening",
      temporaryImageUrls: undefined,
      temporaryVideoUrl: "https://cdn.example.com/video.mp4",
      thumbnailUrl: "https://cdn.example.com/cover.jpg",
    });
  });

  it("normalizes carousel images as a slideshow", () => {
    const source = createHookLabInstagramSource(
      {
        caption: "Swipe through the steps",
        childPosts: [
          { displayUrl: "https://cdn.example.com/slide-1.jpg" },
          { displayUrl: "https://cdn.example.com/slide-2.jpg" },
        ],
        displayUrl: "https://cdn.example.com/slide-1.jpg",
        type: "Sidecar",
        url: "https://www.instagram.com/p/ABC123/",
      },
      "https://www.instagram.com/p/ABC123/",
    );

    expect(source.mediaKind).toBe("slideshow");
    expect(source.temporaryImageUrls).toEqual([
      "https://cdn.example.com/slide-1.jpg",
      "https://cdn.example.com/slide-2.jpg",
    ]);
    expect(source.temporaryVideoUrl).toBeUndefined();
  });
});
