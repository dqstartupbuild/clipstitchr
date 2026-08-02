import { describe, expect, it } from "vitest";
import { createSwipePublishingSlideObjectKey } from "@/lib/clipstitchr/publishing/media/createSwipePublishingSlideObjectKey";

describe("createSwipePublishingSlideObjectKey", () => {
  it("places ordered immutable slides under the owner and Swipe", () => {
    const revision = "a".repeat(64);
    const checksumSha256 = `${"A".repeat(43)}=`;

    expect(
      createSwipePublishingSlideObjectKey({
        checksumSha256,
        ownerId: "user/123",
        revision,
        slideIndex: 2,
        swipeId: "swipe/123",
      }),
    ).toBe(
      `users/user%2F123/swipes/swipe-123/publishing/${revision}/slide-03-${"A".repeat(43)}.jpg`,
    );
  });

  it("rejects unbounded indices and non-digest revisions", () => {
    expect(() =>
      createSwipePublishingSlideObjectKey({
        checksumSha256: `${"A".repeat(43)}=`,
        ownerId: "user_123",
        revision: "not-a-digest",
        slideIndex: 0,
        swipeId: "swipe_123",
      }),
    ).toThrow("SHA-256 digest");
    expect(() =>
      createSwipePublishingSlideObjectKey({
        checksumSha256: `${"A".repeat(43)}=`,
        ownerId: "user_123",
        revision: "a".repeat(64),
        slideIndex: 8,
        swipeId: "swipe_123",
      }),
    ).toThrow("out of range");
  });
});
