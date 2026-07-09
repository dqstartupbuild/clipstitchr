import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createQueueMenuChoices } from "../../dist/queueMenu/createQueueMenuChoices.js";

describe("createQueueMenuChoices", () => {
  it("shows the focused queue actions", () => {
    assert.deepEqual(
      createQueueMenuChoices().map((choice) => choice.name),
      [
        "Show upcoming queue",
        "Queue latest Stitch",
        "Queue all Stitches",
        "Queue latest Swipe",
        "Queue all Swipes",
        "Queue everything",
        "Queue a specific Stitch",
        "Queue a specific Swipe",
      ],
    );
  });
});
