import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("native commands", () => {
  it("shows native init and check as primary commands", () => {
    const output = readCliOutput(["native", "--help"]);

    assert.match(output, /init \[options\]\s+Prepare this Mac/);
    assert.match(output, /check\s+Check native helper setup/);
    assert.doesNotMatch(output, /\n\s+helper\b/);
  });

  it("keeps native helper aliases reachable", () => {
    assert.match(
      readCliOutput(["native", "helper", "install", "--help"]),
      /Legacy alias for native init/,
    );
    assert.match(
      readCliOutput(["native", "helper", "check", "--help"]),
      /Legacy alias for native check/,
    );
  });
});
