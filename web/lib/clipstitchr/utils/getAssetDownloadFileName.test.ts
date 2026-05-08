import { describe, expect, it } from "vitest";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";

describe("getAssetDownloadFileName", () => {
  it("normalizes names for downloads", () => {
    expect(getAssetDownloadFileName("My UGC Clip.mov", "mp4")).toBe(
      "my-ugc-clip.mp4",
    );
  });

  it("uses a fallback when the name has no usable characters", () => {
    expect(getAssetDownloadFileName("!!!", "jpg")).toBe("clipstitchr-asset.jpg");
  });
});
