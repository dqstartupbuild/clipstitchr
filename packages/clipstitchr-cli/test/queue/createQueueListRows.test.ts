import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createQueueListRows } from "../../dist/queue/createQueueListRows.js";
import { queueListEmptyMessage } from "../../dist/queue/queueListEmptyMessage.js";

describe("createQueueListRows", () => {
  it("formats mixed Stitch and Swipe queue rows", () => {
    assert.deepEqual(
      createQueueListRows([
        {
          accountIds: [123, 456],
          captionPreview: "Caption",
          contentType: "stitch",
          postId: "post_1",
          productName: "Launch Kit",
          queuePosition: 1,
          sourceId: "stitch_1",
          status: "scheduled",
          title: "Launch demo",
        },
        {
          accountIds: [],
          captionPreview: "Swipe caption",
          contentType: "swipe",
          postId: "post_2",
          productId: "product_1",
          scheduledAt: "2026-07-09T20:30:00.000Z",
          sourceId: "swipe_1",
          status: "processing",
          title: "Swipe carousel",
        },
      ]),
      [
        "Type\tWhen\tStatus\tTitle\tProduct\tAccounts",
        "Stitch\tQueue #1\tscheduled\tLaunch demo\tLaunch Kit\t123,456",
        "Swipe\tScheduled 2026-07-09T20:30:00.000Z\tprocessing\tSwipe carousel\tproduct_1\tdefault",
      ],
    );
  });

  it("keeps empty queue copy plain", () => {
    assert.equal(
      queueListEmptyMessage,
      "No queued Stitches or Swipes are coming up in the next 24 hours.",
    );
  });
});
