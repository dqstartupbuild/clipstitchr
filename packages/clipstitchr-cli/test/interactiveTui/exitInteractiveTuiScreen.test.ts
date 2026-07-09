import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exitInteractiveTuiScreen } from "../../dist/interactiveTui/exitInteractiveTuiScreen.js";

describe("exitInteractiveTuiScreen", () => {
  it("restores the original terminal screen", () => {
    const writes: string[] = [];

    exitInteractiveTuiScreen({
      isTTY: true,
      write: (value) => writes.push(value),
    });

    assert.deepEqual(writes, ["\u001B[?1049l"]);
  });
});
