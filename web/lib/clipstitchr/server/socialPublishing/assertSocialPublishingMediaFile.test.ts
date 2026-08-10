import { describe, expect, it } from "vitest";
import { assertSocialPublishingMediaFile } from "@/lib/clipstitchr/server/socialPublishing/assertSocialPublishingMediaFile";

describe("assertSocialPublishingMediaFile", () => {
  it("accepts Zernio image and video media", () => {
    expect(() =>
      assertSocialPublishingMediaFile(new File(["image"], "slide.png", { type: "image/png" })),
    ).not.toThrow();
    expect(() =>
      assertSocialPublishingMediaFile(
        new File(["video"], "stitch.mp4", {
          type: "video/mp4; codecs=avc1.42E01E",
        }),
      ),
    ).not.toThrow();
  });

  it("rejects unsupported media and empty files", () => {
    expect(() =>
      assertSocialPublishingMediaFile(new File(["text"], "notes.txt", { type: "text/plain" })),
    ).toThrow("Zernio supports PNG, JPEG, MP4, or MOV media.");
    expect(() =>
      assertSocialPublishingMediaFile(new File([], "empty.png", { type: "image/png" })),
    ).toThrow("Choose media before scheduling.");
  });
});
