import { describe, expect, it } from "vitest";
import { assertPostBridgeMediaFile } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeMediaFile";

describe("assertPostBridgeMediaFile", () => {
  it("accepts Post Bridge image and video media", () => {
    expect(() =>
      assertPostBridgeMediaFile(new File(["image"], "slide.png", { type: "image/png" })),
    ).not.toThrow();
    expect(() =>
      assertPostBridgeMediaFile(
        new File(["video"], "stitch.mp4", {
          type: "video/mp4; codecs=avc1.42E01E",
        }),
      ),
    ).not.toThrow();
  });

  it("rejects unsupported media and empty files", () => {
    expect(() =>
      assertPostBridgeMediaFile(new File(["text"], "notes.txt", { type: "text/plain" })),
    ).toThrow("Post Bridge supports PNG, JPEG, MP4, or MOV media.");
    expect(() =>
      assertPostBridgeMediaFile(new File([], "empty.png", { type: "image/png" })),
    ).toThrow("Choose media before scheduling.");
  });
});
