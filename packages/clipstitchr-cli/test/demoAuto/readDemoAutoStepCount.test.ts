import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readDemoAutoStepCount } from "../../dist/commands/readDemoAutoStepCount.js";

describe("readDemoAutoStepCount", () => {
  it("defaults to five steps", () => {
    assert.equal(readDemoAutoStepCount(), 5);
  });

  it("keeps generated guides inside the supported range", () => {
    assert.equal(readDemoAutoStepCount("2"), 3);
    assert.equal(readDemoAutoStepCount("6"), 6);
    assert.equal(readDemoAutoStepCount("20"), 8);
  });
});
