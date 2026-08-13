import { describe, expect, it } from "vitest";
import { parsePublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/parsePublishingMediaSourceDescriptor";

describe("parsePublishingMediaSourceDescriptor", () => {
  it.each(["stitch", "swipe", "library-media"] as const)(
    "accepts a bounded %s descriptor",
    (kind) => {
      expect(
        parsePublishingMediaSourceDescriptor({ kind, recordId: "record_123" }),
      ).toEqual({ kind, recordId: "record_123" });
    },
  );

  it("rejects browser blob URLs and raw R2 keys", () => {
    expect(() =>
      parsePublishingMediaSourceDescriptor({
        kind: "stitch",
        recordId: "blob:https://clipstitchr.com/local-video",
      }),
    ).toThrow("record ID is invalid");
    expect(() =>
      parsePublishingMediaSourceDescriptor(
        "users/user_123/stitches/stitch_123/video.mp4",
      ),
    ).toThrow("Choose a saved ClipStitchr media item");
  });

  it("rejects client-supplied URLs, object keys, and extra fields", () => {
    expect(() =>
      parsePublishingMediaSourceDescriptor({
        kind: "stitch",
        objectKey: "users/user_123/stitches/stitch_123/video.mp4",
        recordId: "stitch_123",
      }),
    ).toThrow("accepts only a saved item type and record ID");
    expect(() =>
      parsePublishingMediaSourceDescriptor({
        kind: "stitch",
        recordId: "stitch_123",
        url: "https://media.example.com/video.mp4?token=secret",
      }),
    ).toThrow("accepts only a saved item type and record ID");
  });
});
