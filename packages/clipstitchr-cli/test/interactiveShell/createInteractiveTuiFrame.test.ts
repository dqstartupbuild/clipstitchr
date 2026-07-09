import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInteractiveTuiFrame } from "../../dist/interactiveShell/createInteractiveTuiFrame.js";

describe("createInteractiveTuiFrame", () => {
  it("renders the stable TUI boundary and hints", () => {
    const frame = createInteractiveTuiFrame({
      columns: 64,
      menu: "queue",
      notice: {
        kind: "success",
        message: "Queued the latest Stitch.",
      },
    });
    const lines = frame.split("\n");

    assert.equal(lines[0], "+--------------------------------------------------------------+");
    assert(lines.some((line) => line.includes("ClipStitchr  Interactive")));
    assert(lines.some((line) => line.includes("Menu: Queue")));
    assert(lines.some((line) => line.includes("Done: Queued the latest Stitch.")));
    assert(lines.some((line) => line.includes("Back | Main menu | Exit")));
    assert(lines.every((line) => line.length === 64));
  });
});
