import { describe, expect, it } from "vitest";
import { resolveSocialPublishingMediaKindForFiles } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingMediaKindForFiles";

describe("resolveSocialPublishingMediaKindForFiles", () => {
  it("resolves image carousels and single videos", () => {
    expect(
      resolveSocialPublishingMediaKindForFiles([
        new File(["one"], "one.png", { type: "image/png" }),
        new File(["two"], "two.jpg", { type: "image/jpeg" }),
      ]),
    ).toBe("image");
    expect(
      resolveSocialPublishingMediaKindForFiles([
        new File(["video"], "video.mov", { type: "video/quicktime" }),
      ]),
    ).toBe("video");
  });

  it("rejects mixed media and multiple videos", () => {
    expect(() =>
      resolveSocialPublishingMediaKindForFiles([
        new File(["image"], "image.png", { type: "image/png" }),
        new File(["video"], "video.mp4", { type: "video/mp4" }),
      ]),
    ).toThrow("Schedule either images or one video, not both.");
    expect(() =>
      resolveSocialPublishingMediaKindForFiles([
        new File(["one"], "one.mp4", { type: "video/mp4" }),
        new File(["two"], "two.mp4", { type: "video/mp4" }),
      ]),
    ).toThrow("Schedule one video at a time.");
  });
});
