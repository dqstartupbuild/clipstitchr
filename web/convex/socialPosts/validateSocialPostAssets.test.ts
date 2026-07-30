import { describe, expect, it } from "vitest";
import { validateSocialPostAssets } from "./validateSocialPostAssets";

describe("validateSocialPostAssets", () => {
  it("accepts provider-safe JPEG carousel media", () => {
    expect(() =>
      validateSocialPostAssets(
        [
          {
            id: "asset_1",
            order: 0,
            kind: "image",
            objectKey: "social-post-assets/owner_1/one.jpg",
            contentType: "image/jpeg",
            sizeBytes: 500_000,
            width: 1_080,
            height: 1_350,
          },
          {
            id: "asset_2",
            order: 1,
            kind: "image",
            objectKey: "social-post-assets/owner_1/two.jpg",
            contentType: "image/jpeg",
            sizeBytes: 500_000,
            width: 1_080,
            height: 1_350,
          },
        ],
        ["instagram", "tiktok"],
      ),
    ).not.toThrow();
  });

  it("rejects PNG for TikTok and 9:16 feed photos for Instagram", () => {
    const asset = {
      id: "asset_1",
      order: 0,
      kind: "image" as const,
      objectKey: "social-post-assets/owner_1/one.png",
      contentType: "image/png",
      sizeBytes: 500_000,
      width: 1_080,
      height: 1_920,
    };

    expect(() => validateSocialPostAssets([asset], ["tiktok"])).toThrow(
      "JPEG or WebP",
    );
    expect(() =>
      validateSocialPostAssets(
        [{ ...asset, contentType: "image/jpeg" }],
        ["instagram"],
      ),
    ).toThrow("portrait 4:5");
  });

  it("validates Reel duration and final video metadata", () => {
    const asset = {
      id: "asset_1",
      order: 0,
      kind: "video" as const,
      objectKey: "social-post-assets/owner_1/video.mp4",
      contentType: "video/mp4",
      sizeBytes: 5_000_000,
      width: 1_080,
      height: 1_920,
      durationSeconds: 2,
    };

    expect(() => validateSocialPostAssets([asset], ["instagram"])).toThrow(
      "between 3 seconds and 15 minutes",
    );
    expect(() =>
      validateSocialPostAssets(
        [{ ...asset, durationSeconds: undefined }],
        ["tiktok"],
      ),
    ).toThrow("dimensions or duration are missing");
  });
});
