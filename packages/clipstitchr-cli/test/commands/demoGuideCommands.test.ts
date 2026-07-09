import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("demo guide commands", () => {
  it("shows create and save-instructions as primary commands", () => {
    const output = readCliOutput(["demo", "guide", "--help"]);

    assert.match(output, /Create a walkthrough guide/);
    assert.match(output, /Save local instructions for a guide/);
    assert.doesNotMatch(output, /Legacy alias for demo guide create/);
    assert.doesNotMatch(
      output,
      /Legacy alias for demo guide save-instructions/,
    );
  });

  it("keeps generate as a reachable alias", () => {
    assert.match(
      readCliOutput(["demo", "guide", "generate", "--help"]),
      /Legacy alias for demo guide create/,
    );
  });

  it("keeps export-instructions as a reachable alias", () => {
    assert.match(
      readCliOutput(["demo", "guide", "export-instructions", "--help"]),
      /Legacy alias for demo guide save-instructions/,
    );
  });
});
