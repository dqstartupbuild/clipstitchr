import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLatestQueueableSwipe } from "../../dist/queue/getLatestQueueableSwipe.js";

describe("getLatestQueueableSwipe", () => {
  it("chooses the first saved active Swipe with rendered media", () => {
    const swipe = getLatestQueueableSwipe([
      {
        createdAt: "2026-01-03T00:00:00.000Z",
        hasRenderedImage: false,
        id: "swipe_missing_image",
        name: "Needs photo",
        slideCount: 3,
        updatedAt: "2026-01-03T00:00:00.000Z",
      },
      {
        createdAt: "2026-01-02T00:00:00.000Z",
        hasRenderedImage: true,
        id: "swipe_ready",
        name: "Ready",
        slideCount: 3,
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
      {
        createdAt: "2026-01-01T00:00:00.000Z",
        hasRenderedImage: true,
        id: "swipe_posted",
        isPosted: true,
        name: "Posted",
        slideCount: 3,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    assert.equal(swipe.id, "swipe_ready");
  });

  it("rejects when no Swipe has saved rendered media", () => {
    assert.throws(
      () =>
        getLatestQueueableSwipe([
          {
            createdAt: "2026-01-03T00:00:00.000Z",
            hasRenderedImage: false,
            id: "swipe_missing_image",
            name: "Needs photo",
            slideCount: 3,
            updatedAt: "2026-01-03T00:00:00.000Z",
          },
        ]),
      /No ready active Swipes/,
    );
  });
});
