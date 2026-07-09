import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDemoAgentPolicyList } from "../../dist/demoAgentPolicyEditor/parseDemoAgentPolicyList.js";

describe("parseDemoAgentPolicyList", () => {
  it("reads comma and newline separated policy values", () => {
    assert.deepEqual(parseDemoAgentPolicyList("/, /upload\n/settings"), [
      "/",
      "/upload",
      "/settings",
    ]);
  });
});
