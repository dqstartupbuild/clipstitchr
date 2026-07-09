import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enterInteractiveTuiScreen } from "../../dist/interactiveTui/enterInteractiveTuiScreen.js";

describe("enterInteractiveTuiScreen", () => {
  it("opens and clears the alternate terminal screen", () => {
    const writes: string[] = [];

    enterInteractiveTuiScreen({
      isTTY: true,
      write: (value) => writes.push(value),
    });

    assert.deepEqual(writes, ["\u001B[?1049h\u001B[2J\u001B[H"]);
  });
});
