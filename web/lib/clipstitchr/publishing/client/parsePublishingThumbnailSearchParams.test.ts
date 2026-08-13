import { describe, expect, it } from "vitest";
import { parsePublishingThumbnailSearchParams } from "@/lib/clipstitchr/publishing/client/parsePublishingThumbnailSearchParams";

describe("parsePublishingThumbnailSearchParams", () => {
  it("accepts a complete bounded durable selection", () => {
    expect(
      parsePublishingThumbnailSearchParams({
        thumbnailKind: "library-media",
        thumbnailRecordId: "image_1",
        thumbnailRevision: "a".repeat(64),
      }),
    ).toEqual({
      error: null,
      selection: {
        media: { kind: "library-media", recordId: "image_1" },
        mediaRevision: "a".repeat(64),
      },
    });
  });

  it("drops partial, repeated, and malformed selections", () => {
    expect(
      parsePublishingThumbnailSearchParams({
        thumbnailKind: "library-media",
        thumbnailRecordId: "image_1",
      }),
    ).toMatchObject({ selection: null });
    expect(
      parsePublishingThumbnailSearchParams({
        thumbnailKind: ["library-media", "stitch"],
        thumbnailRecordId: "image_1",
        thumbnailRevision: "a".repeat(64),
      }),
    ).toMatchObject({ selection: null });
    expect(
      parsePublishingThumbnailSearchParams({
        thumbnailKind: "library-media",
        thumbnailRecordId: "../private-image",
        thumbnailRevision: "a".repeat(64),
      }),
    ).toMatchObject({ selection: null });
  });
});
