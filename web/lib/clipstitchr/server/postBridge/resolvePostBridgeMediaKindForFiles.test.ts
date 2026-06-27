import { describe, expect, it } from "vitest";
import { resolvePostBridgeMediaKindForFiles } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeMediaKindForFiles";

describe("resolvePostBridgeMediaKindForFiles", () => {
  it("resolves image carousels and single videos", () => {
    expect(
      resolvePostBridgeMediaKindForFiles([
        new File(["one"], "one.png", { type: "image/png" }),
        new File(["two"], "two.jpg", { type: "image/jpeg" }),
      ]),
    ).toBe("image");
    expect(
      resolvePostBridgeMediaKindForFiles([
        new File(["video"], "video.mov", { type: "video/quicktime" }),
      ]),
    ).toBe("video");
  });

  it("rejects mixed media and multiple videos", () => {
    expect(() =>
      resolvePostBridgeMediaKindForFiles([
        new File(["image"], "image.png", { type: "image/png" }),
        new File(["video"], "video.mp4", { type: "video/mp4" }),
      ]),
    ).toThrow("Schedule either images or one video, not both.");
    expect(() =>
      resolvePostBridgeMediaKindForFiles([
        new File(["one"], "one.mp4", { type: "video/mp4" }),
        new File(["two"], "two.mp4", { type: "video/mp4" }),
      ]),
    ).toThrow("Schedule one video at a time.");
  });
});
