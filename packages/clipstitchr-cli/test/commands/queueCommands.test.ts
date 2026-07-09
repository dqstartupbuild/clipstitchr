import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("queue commands", () => {
  it("shows queue as the primary content queue command", () => {
    const output = readCliOutput(["queue", "--help"]);

    assert.match(output, /--all\s+Queue all active Stitches and Swipes/);
    assert.match(output, /stitch \[options\] \[stitchId\]/);
    assert.match(output, /swipe \[options\] \[swipeId\]/);
  });

  it("adds all options to Stitch and Swipe queue commands", () => {
    assert.match(readCliOutput(["queue", "stitch", "--help"]), /--all/);
    assert.match(readCliOutput(["queue", "swipe", "--help"]), /--all/);
  });

  it("hides library browsing from primary help", () => {
    const output = readCliOutput(["--help"]);

    assert.doesNotMatch(output, /\nlibrary\b/);
    assert.match(readCliOutput(["library", "--help"]), /Legacy library/);
  });
});
