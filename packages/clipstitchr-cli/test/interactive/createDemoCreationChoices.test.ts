import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoCreationChoices } from "../../dist/interactive/createDemoCreationChoices.js";

describe("createDemoCreationChoices", () => {
  it("offers manual and AI recording choices", () => {
    assert.deepEqual(createDemoCreationChoices(), [
      {
        name: "Record it myself",
        value: "manual",
      },
      {
        name: "Let AI record it for me",
        value: "agent",
      },
    ]);
  });
});
