import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readDemoAgentPolicyInteger } from "../../dist/demoAgentPolicyEditor/readDemoAgentPolicyInteger.js";

describe("readDemoAgentPolicyInteger", () => {
  it("clamps edited policy limits", () => {
    assert.equal(
      readDemoAgentPolicyInteger({
        fallback: 80,
        maximum: 200,
        minimum: 1,
        value: "500",
      }),
      200,
    );
  });

  it("keeps the current value when input is invalid", () => {
    assert.equal(
      readDemoAgentPolicyInteger({
        fallback: 80,
        maximum: 200,
        minimum: 1,
        value: "many",
      }),
      80,
    );
  });
});
