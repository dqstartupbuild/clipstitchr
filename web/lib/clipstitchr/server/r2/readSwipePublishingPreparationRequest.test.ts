import { describe, expect, it } from "vitest";
import { MAX_SWIPE_PUBLISHING_SLIDE_BYTES } from "@/lib/clipstitchr/publishing/media/maxSwipePublishingSlideBytes";
import { readSwipePublishingPreparationRequest } from "@/lib/clipstitchr/server/r2/readSwipePublishingPreparationRequest";

function jsonRequest(body: unknown) {
  return new Request("https://clipstitchr.test", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("readSwipePublishingPreparationRequest", () => {
  it("reads a bounded preparation-only request", async () => {
    await expect(
      readSwipePublishingPreparationRequest(
        jsonRequest({ swipeId: " swipe_123 " }),
      ),
    ).resolves.toEqual({ swipeId: "swipe_123" });
  });

  it("reads ordered checksum and byte-bound upload metadata", async () => {
    const checksumSha256 = `${"A".repeat(43)}=`;
    const slides = Array.from({ length: 3 }, (_, index) => ({
      checksumSha256,
      index,
      sizeBytes: 100 + index,
    }));

    await expect(
      readSwipePublishingPreparationRequest(
        jsonRequest({
          revision: "a".repeat(64),
          slides,
          swipeId: "swipe_123",
        }),
      ),
    ).resolves.toEqual({
      revision: "a".repeat(64),
      slides,
      swipeId: "swipe_123",
    });
  });

  it("rejects reordered, malformed, and oversized slide uploads", async () => {
    const checksumSha256 = `${"A".repeat(43)}=`;
    const validSlides = Array.from({ length: 3 }, (_, index) => ({
      checksumSha256,
      index,
      sizeBytes: 100,
    }));

    for (const slides of [
      [{ ...validSlides[0], index: 1 }, ...validSlides.slice(1)],
      [{ ...validSlides[0], checksumSha256: "invalid" }, ...validSlides.slice(1)],
      [
        { ...validSlides[0], sizeBytes: MAX_SWIPE_PUBLISHING_SLIDE_BYTES + 1 },
        ...validSlides.slice(1),
      ],
    ]) {
      await expect(
        readSwipePublishingPreparationRequest(
          jsonRequest({
            revision: "a".repeat(64),
            slides,
            swipeId: "swipe_123",
          }),
        ),
      ).rejects.toThrow("Invalid Swipe publishing slide upload");
    }
  });
});
