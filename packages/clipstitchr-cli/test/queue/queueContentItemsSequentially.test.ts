import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { queueContentItemsSequentially } from "../../dist/queue/queueContentItemsSequentially.js";

describe("queueContentItemsSequentially", () => {
  it("queues one item at a time and keeps partial failure details", async () => {
    const calls: string[] = [];
    const items = [
      {
        item: {
          createdAt: "2026-01-01T00:00:00.000Z",
          duration: 12,
          hasRenderedVideo: true,
          id: "stitch_1",
          name: "First",
        },
        type: "stitch" as const,
      },
      {
        item: {
          createdAt: "2026-01-02T00:00:00.000Z",
          hasRenderedImage: true,
          id: "swipe_1",
          name: "Second",
          slideCount: 3,
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
        type: "swipe" as const,
      },
    ];

    const results = await queueContentItemsSequentially(items, async (item) => {
      calls.push(item.item.id);

      if (item.type === "swipe") {
        throw new Error("not ready");
      }

      return {
        postReference: {
          postId: "post_1",
          status: "queued",
        },
      };
    });

    assert.deepEqual(calls, ["stitch_1", "swipe_1"]);
    assert.deepEqual(results, [
      {
        item: items[0],
        postId: "post_1",
        postStatus: "queued",
        queued: true,
      },
      {
        item: items[1],
        message: "not ready",
        queued: false,
      },
    ]);
  });
});
