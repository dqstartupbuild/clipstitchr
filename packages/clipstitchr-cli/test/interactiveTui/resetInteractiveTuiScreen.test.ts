import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resetInteractiveTuiScreen } from "../../dist/interactiveTui/resetInteractiveTuiScreen.js";

describe("resetInteractiveTuiScreen", () => {
  it("clears output and returns the cursor to the top", () => {
    const writes: string[] = [];

    resetInteractiveTuiScreen({
      isTTY: true,
      write: (value) => writes.push(value),
    });

    assert.deepEqual(writes, ["\u001B[2J\u001B[H"]);
  });
});
