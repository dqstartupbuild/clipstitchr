import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNextInteractiveTuiSelectionIndex } from "../../dist/interactiveTui/getNextInteractiveTuiSelectionIndex.js";

describe("getNextInteractiveTuiSelectionIndex", () => {
  it("wraps selection in both directions", () => {
    assert.equal(
      getNextInteractiveTuiSelectionIndex({
        currentIndex: 2,
        direction: "down",
        itemCount: 3,
      }),
      0,
    );
    assert.equal(
      getNextInteractiveTuiSelectionIndex({
        currentIndex: 0,
        direction: "up",
        itemCount: 3,
      }),
      2,
    );
  });
});
