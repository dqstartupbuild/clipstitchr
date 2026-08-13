import { describe, expect, it } from "vitest";
import { getStudioClipsPlatformRenderPreset } from "./getStudioClipsPlatformRenderPreset";

describe("getStudioClipsPlatformRenderPreset", () => {
  it.each(["tiktok", "instagram_reels", "youtube_shorts"] as const)(
    "defines a deterministic 9:16 H.264/AAC preset for %s",
    (name) => {
      expect(getStudioClipsPlatformRenderPreset(name)).toMatchObject({
        audioBitrate: "192k",
        audioCodec: "aac",
        frameRate: 30,
        height: 1920,
        maximumDurationSeconds: 180,
        name,
        pixelFormat: "yuv420p",
        videoCodec: "libx264",
        width: 1080,
      });
      expect(getStudioClipsPlatformRenderPreset(name).videoMaximumRate).toBe(
        name === "instagram_reels" ? "12M" : "10M",
      );
      expect(getStudioClipsPlatformRenderPreset(name).videoBufferSize).toBe(
        name === "instagram_reels" ? "24M" : "20M",
      );
    },
  );
});
