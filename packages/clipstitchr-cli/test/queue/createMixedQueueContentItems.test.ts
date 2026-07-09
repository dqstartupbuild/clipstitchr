import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMixedQueueContentItems } from "../../dist/queue/createMixedQueueContentItems.js";

describe("createMixedQueueContentItems", () => {
  it("mixes Stitches and Swipes through a randomized order", () => {
    const items = createMixedQueueContentItems({
      random: () => 0,
      stitches: [
        {
          createdAt: "2026-01-01T00:00:00.000Z",
          duration: 12,
          hasRenderedVideo: true,
          id: "stitch_1",
          name: "Launch Stitch",
        },
      ],
      swipes: [
        {
          createdAt: "2026-01-02T00:00:00.000Z",
          hasRenderedImage: true,
          id: "swipe_1",
          name: "Launch Swipe",
          slideCount: 3,
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
    });

    assert.deepEqual(
      items.map((item) => item.type),
      ["swipe", "stitch"],
    );
  });
});
