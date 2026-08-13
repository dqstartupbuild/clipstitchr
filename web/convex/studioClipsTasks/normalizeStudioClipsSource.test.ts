import { describe, expect, it } from "vitest";
import { normalizeStudioClipsSource } from "./normalizeStudioClipsSource";

describe("normalizeStudioClipsSource", () => {
  it("canonicalizes supported YouTube forms without fetching them", () => {
    expect(
      normalizeStudioClipsSource(
        { kind: "youtube", url: "https://youtu.be/dQw4w9WgXcQ?t=12" },
        "user_1",
        "product_1",
      ),
    ).toEqual({
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it.each([
    "",
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&redirect=https://evil.test",
  ])("rejects unsupported or empty URL input: %s", (url) => {
    expect(() =>
      normalizeStudioClipsSource(
        { kind: "youtube", url },
        "user_1",
        "product_1",
      ),
    ).toThrow("supported HTTPS YouTube");
  });

  it("accepts only owned Studio media-source keys with worker media types", () => {
    expect(
      normalizeStudioClipsSource(
        {
          contentType: "video/mp4; charset=binary",
          kind: "r2",
          objectKey:
            "users/user_1/studio/v1/media-source/product_1/record/file.mp4",
          sizeBytes: 1024,
        },
        "user_1",
        "product_1",
      ),
    ).toMatchObject({ contentType: "video/mp4", sizeBytes: 1024 });
    expect(() =>
      normalizeStudioClipsSource(
        {
          contentType: "video/mp4",
          kind: "r2",
          objectKey:
            "users/user_2/studio/v1/media-source/product_1/record/file.mp4",
          sizeBytes: 1024,
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
    expect(() =>
      normalizeStudioClipsSource(
        {
          contentType: "video/mp4",
          kind: "r2",
          objectKey:
            "users/user_1/studio/v1/media-source/product_1/record/../private.mp4",
          sizeBytes: 1024,
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
    expect(() =>
      normalizeStudioClipsSource(
        {
          contentType: "video/mp4",
          kind: "r2",
          objectKey:
            "users/user_1/studio/v1/media-source/product_2/record/file.mp4",
          sizeBytes: 1024,
        },
        "user_1",
        "product_1",
      ),
    ).toThrow("another Product");
  });
});
