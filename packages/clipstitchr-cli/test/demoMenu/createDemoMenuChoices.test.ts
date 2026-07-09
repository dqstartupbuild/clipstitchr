import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoMenuChoices } from "../../dist/demoMenu/createDemoMenuChoices.js";

describe("createDemoMenuChoices", () => {
  it("shows core demo actions", () => {
    const labels = createDemoMenuChoices("linux").map((choice) => choice.name);

    assert.deepEqual(labels.slice(0, 4), [
      "Record it myself",
      "Let AI record it for me",
      "Create a guide",
      "Show my guides",
    ]);
    assert(labels.includes("Upload a demo"));
    assert(labels.includes("Show AI run logs"));
  });

  it("adds native helper setup on macOS", () => {
    const labels = createDemoMenuChoices("darwin").map((choice) => choice.name);

    assert(labels.includes("Set up Mac window recording"));
  });
});
