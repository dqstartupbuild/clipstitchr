import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("demo agent commands", () => {
  it("shows demo agent as the primary automated recording command", () => {
    const demoHelp = readCliOutput(["demo", "--help"]);
    const agentHelp = readCliOutput(["demo", "agent", "--help"]);

    assert.match(demoHelp, /agent \[options\]\s+Record a demo/);
    assert.doesNotMatch(demoHelp, /\nauto\b/);
    assert.match(agentHelp, /--guide <name-id-or-path>/);
    assert.match(agentHelp, /--upload/);
    assert.match(agentHelp, /--no-upload/);
    assert.doesNotMatch(agentHelp, /--dry-run/);
  });

  it("keeps legacy auto and run commands reachable", () => {
    assert.match(
      readCliOutput(["demo", "auto", "--help"]),
      /Legacy alias for demo agent/,
    );
    assert.match(
      readCliOutput(["demo", "agent", "run", "--help"]),
      /Legacy alias for demo agent --guide/,
    );
    assert.match(
      readCliOutput(["demo", "agent", "run", "--help"]),
      /--dry-run/,
    );
  });
});
