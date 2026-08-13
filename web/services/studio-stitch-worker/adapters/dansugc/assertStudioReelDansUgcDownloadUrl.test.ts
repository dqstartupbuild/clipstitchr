import { describe, expect, it } from "vitest";
import { assertStudioReelDansUgcDownloadUrl } from "./assertStudioReelDansUgcDownloadUrl";

describe("assertStudioReelDansUgcDownloadUrl", () => {
  it("accepts only exact configured HTTPS storage hosts", () => {
    expect(
      assertStudioReelDansUgcDownloadUrl(
        "https://media.example.test/full/video.mp4?signature=private",
        ["media.example.test"],
      ).hostname,
    ).toBe("media.example.test");
    for (const value of [
      "http://media.example.test/full/video.mp4",
      "https://evil.media.example.test/full/video.mp4",
      "https://media.example.test.evil.test/full/video.mp4",
      "https://user:pass@media.example.test/full/video.mp4",
      "https://media.example.test:444/full/video.mp4",
      "https://media.example.test/full/video.mp4#fragment",
    ]) {
      expect(() =>
        assertStudioReelDansUgcDownloadUrl(value, ["media.example.test"]),
      ).toThrow("unapproved");
    }
  });
});
