import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAutoGoal } from "../../dist/commands/createDemoAutoGoal.js";

describe("createDemoAutoGoal", () => {
  it("uses an explicit goal when provided", () => {
    assert.equal(
      createDemoAutoGoal({
        flow: { confidence: "high", name: "Dashboard tour", path: "/dashboard" },
        goal: "Show the upload flow",
      }),
      "Show the upload flow",
    );
  });

  it("falls back to the selected flow name", () => {
    assert.equal(
      createDemoAutoGoal({
        flow: { confidence: "high", name: "Dashboard tour", path: "/dashboard" },
      }),
      "Dashboard tour",
    );
  });

  it("uses a stable default without prompting", () => {
    assert.equal(
      createDemoAutoGoal({}),
      "Show the main product flow",
    );
  });
});
