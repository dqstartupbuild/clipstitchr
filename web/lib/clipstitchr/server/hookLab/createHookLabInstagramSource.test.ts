import { describe, expect, it } from "vitest";
import { createHookLabInstagramSource } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramSource";

describe("createHookLabInstagramSource", () => {
  it("normalizes an Instagram Scraper video item", () => {
    expect(
      createHookLabInstagramSource(
        {
          caption: "A useful opening",
          displayUrl: "https://cdn.example.com/cover.jpg",
          id: "post_123",
          ownerFullName: "Creator Name",
          ownerUsername: "creator",
          productType: "clips",
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
      platform: "instagram",
      sourceCreatedAt: "2026-07-01T12:30:00.000Z",
      sourcePostId: "post_123",
      sourceText: "A useful opening",
      temporaryVideoUrl: "https://cdn.example.com/video.mp4",
      thumbnailUrl: "https://cdn.example.com/cover.jpg",
    });
  });

  it("rejects carousel and image-only output", () => {
    expect(() =>
      createHookLabInstagramSource(
        { type: "Sidecar" },
        "https://www.instagram.com/p/ABC123/",
      ),
    ).toThrow("Instagram video posts and reels");
  });
});
