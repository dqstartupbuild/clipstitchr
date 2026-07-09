import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("Stitchr and Swipr creation commands", () => {
  it("shows new as the primary Stitchr command", () => {
    const output = readCliOutput(["stitchr", "--help"]);

    assert.match(output, /new \[options\]\s+Start new Stitchr work/);
    assert.doesNotMatch(output, /\nbatch\b/);
  });

  it("shows new as the primary Swipr command", () => {
    const output = readCliOutput(["swipr", "--help"]);

    assert.match(output, /new \[options\]\s+Start new Swipr drafts/);
    assert.doesNotMatch(output, /\nbatch\b/);
  });

  it("preserves Stitchr options on new and batch", () => {
    const newHelp = readCliOutput(["stitchr", "new", "--help"]);
    const batchHelp = readCliOutput(["stitchr", "batch", "--help"]);

    for (const option of [
      "--product <id>",
      "--sound <id>",
      "--template <id>",
      "--time-zone <name>",
    ]) {
      assert.match(newHelp, new RegExp(option.replace(/[<>]/g, "\\$&")));
      assert.match(batchHelp, new RegExp(option.replace(/[<>]/g, "\\$&")));
    }
  });

  it("preserves Swipr options on new and batch", () => {
    const newHelp = readCliOutput(["swipr", "new", "--help"]);
    const batchHelp = readCliOutput(["swipr", "batch", "--help"]);

    assert.match(newHelp, /--product <id>/);
    assert.match(batchHelp, /--product <id>/);
  });

  it("keeps batch as a reachable alias", () => {
    assert.match(
      readCliOutput(["stitchr", "batch", "--help"]),
      /Legacy alias for stitchr new/,
    );
    assert.match(
      readCliOutput(["swipr", "batch", "--help"]),
      /Legacy alias for swipr new/,
    );
  });
});
