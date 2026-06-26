import { describe, expect, it } from "vitest";
import { getTikTokImportContentType } from "@/lib/clipstitchr/server/tiktok/getTikTokImportContentType";

describe("getTikTokImportContentType", () => {
  it("keeps accepted audio types", () => {
    expect(getTikTokImportContentType("audio/mpeg")).toBe("audio/mpeg");
  });

  it("maps TikTok MP4 downloads to audio-compatible MP4", () => {
    expect(getTikTokImportContentType("video/mp4")).toBe("audio/mp4");
  });

  it("rejects unsupported media types", () => {
    expect(getTikTokImportContentType("text/html")).toBeNull();
  });
});
