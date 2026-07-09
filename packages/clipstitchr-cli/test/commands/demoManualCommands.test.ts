import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("demo manual commands", () => {
  it("shows manual as the primary recording command", () => {
    const output = readCliOutput(["demo", "--help"]);

    assert.match(output, /manual \[options\]\s+Record a demo yourself/);
    assert.doesNotMatch(output, /Legacy alias for demo manual/);
  });

  it("preserves manual recording options on manual and make", () => {
    const manualHelp = readCliOutput(["demo", "manual", "--help"]);
    const makeHelp = readCliOutput(["demo", "make", "--help"]);

    for (const option of [
      "--guide <name-id-or-path>",
      "--no-guide",
      "--no-upload",
      "--output <path>",
      "--product <id>",
      "--start <command>",
      "--url <url>",
    ]) {
      assert.match(manualHelp, new RegExp(option.replace(/[<>]/g, "\\$&")));
      assert.match(makeHelp, new RegExp(option.replace(/[<>]/g, "\\$&")));
    }
  });

  it("keeps make as a reachable alias", () => {
    assert.match(
      readCliOutput(["demo", "make", "--help"]),
      /Legacy alias for demo manual/,
    );
  });
});
