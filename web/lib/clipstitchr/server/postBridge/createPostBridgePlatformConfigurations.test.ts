import { describe, expect, it } from "vitest";
import { createPostBridgePlatformConfigurations } from "@/lib/clipstitchr/server/postBridge/createPostBridgePlatformConfigurations";

describe("createPostBridgePlatformConfigurations", () => {
  it("creates only the requested supported platform configs", () => {
    expect(
      createPostBridgePlatformConfigurations({
        caption: "Launch day",
        mediaIds: ["media_123"],
        platforms: ["tiktok", "youtube"],
        title: "Launch clip",
      }),
    ).toEqual({
      tiktok: {
        caption: "Launch day",
        media: ["media_123"],
        title: "Launch clip",
      },
      youtube: {
        caption: "Launch day",
        media: ["media_123"],
        title: "Launch clip",
      },
    });
  });

  it("uses a TikTok-specific caption when provided", () => {
    expect(
      createPostBridgePlatformConfigurations({
        caption: "Title line\n\nBody copy",
        mediaIds: ["media_123"],
        platforms: ["tiktok", "instagram"],
        tiktokCaption: "Body copy",
        title: "Title line",
      }),
    ).toEqual({
      instagram: {
        caption: "Title line\n\nBody copy",
        media: ["media_123"],
      },
      tiktok: {
        caption: "Body copy",
        media: ["media_123"],
        title: "Title line",
      },
    });
  });
});
