import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiVisibleResultLines } from "../../dist/interactiveTui/getInteractiveTuiVisibleResultLines.js";

describe("getInteractiveTuiVisibleResultLines", () => {
  it("returns a bounded result page with overflow state", () => {
    assert.deepEqual(
      getInteractiveTuiVisibleResultLines({
        lines: ["one", "two", "three", "four"],
        pageSize: 2,
        startIndex: 2,
      }),
      {
        hasMoreAbove: true,
        hasMoreBelow: false,
        lines: ["three", "four"],
        startIndex: 2,
      },
    );
  });

  it("clamps a stale page after output changes", () => {
    assert.equal(
      getInteractiveTuiVisibleResultLines({
        lines: ["only"],
        pageSize: 3,
        startIndex: 20,
      }).startIndex,
      0,
    );
  });
});
