import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLatestQueueableStitch } from "../../dist/queue/getLatestQueueableStitch.js";

describe("getLatestQueueableStitch", () => {
  it("chooses the first ready active Stitch", () => {
    const stitch = getLatestQueueableStitch([
      {
        createdAt: "2026-01-03T00:00:00.000Z",
        duration: 12,
        hasRenderedVideo: false,
        id: "stitch_rendering",
        name: "Rendering",
      },
      {
        createdAt: "2026-01-02T00:00:00.000Z",
        duration: 12,
        hasRenderedVideo: true,
        id: "stitch_ready",
        name: "Ready",
      },
      {
        createdAt: "2026-01-01T00:00:00.000Z",
        duration: 12,
        hasRenderedVideo: true,
        id: "stitch_posted",
        isPosted: true,
        name: "Posted",
      },
    ]);

    assert.equal(stitch.id, "stitch_ready");
  });

  it("rejects when no Stitch is ready", () => {
    assert.throws(
      () =>
        getLatestQueueableStitch([
          {
            createdAt: "2026-01-03T00:00:00.000Z",
            duration: 12,
            hasRenderedVideo: false,
            id: "stitch_rendering",
            name: "Rendering",
          },
        ]),
      /No ready active Stitches/,
    );
  });
});
