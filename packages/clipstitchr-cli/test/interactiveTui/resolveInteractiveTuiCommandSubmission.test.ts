import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveInteractiveTuiCommandSubmission } from "../../dist/interactiveTui/resolveInteractiveTuiCommandSubmission.js";

describe("resolveInteractiveTuiCommandSubmission", () => {
  it("continues incomplete command groups", () => {
    assert.deepEqual(
      resolveInteractiveTuiCommandSubmission({
        commandText: "/policy",
        suggestion: {
          completion: "continue",
          description: "Manage the safety policy",
          value: "/demo policy",
        },
      }),
      { kind: "complete", commandText: "/demo policy " },
    );
  });

  it("runs the selected canonical command", () => {
    assert.deepEqual(
      resolveInteractiveTuiCommandSubmission({
        commandText: "/policy edit",
        suggestion: {
          completion: "run",
          description: "Edit the safety policy",
          value: "/demo policy edit",
        },
      }),
      { kind: "run", commandLine: "/demo policy edit" },
    );
  });

  it("keeps complete commands with user-provided values", () => {
    assert.deepEqual(
      resolveInteractiveTuiCommandSubmission({
        commandText: "/products use product_123",
      }),
      { kind: "run", commandLine: "/products use product_123" },
    );
  });
});
