import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("demo policy commands", () => {
  it("shows the policy command group", () => {
    const output = readCliOutput(["demo", "policy", "--help"]);

    assert.match(output, /Create and review the local safety policy/);
    assert.match(output, /Check the saved local safety policy/);
    assert.match(output, /Review and update the local safety policy/);
  });

  it("hides legacy policy aliases from primary agent help", () => {
    const output = readCliOutput(["demo", "agent", "--help"]);

    assert.doesNotMatch(output, /Legacy alias for demo policy init/);
    assert.doesNotMatch(output, /Legacy alias for demo policy check/);
  });

  it("keeps legacy policy aliases reachable", () => {
    assert.match(
      readCliOutput(["demo", "agent", "init", "--help"]),
      /Legacy alias for demo policy init/,
    );
    assert.match(
      readCliOutput(["demo", "agent", "check", "--help"]),
      /Legacy alias for demo policy check/,
    );
  });
});
