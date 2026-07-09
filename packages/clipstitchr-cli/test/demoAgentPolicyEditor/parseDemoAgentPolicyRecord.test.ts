import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDemoAgentPolicyRecord } from "../../dist/demoAgentPolicyEditor/parseDemoAgentPolicyRecord.js";

describe("parseDemoAgentPolicyRecord", () => {
  it("reads approved test values", () => {
    assert.deepEqual(
      parseDemoAgentPolicyRecord(
        "testEmail=demo@example.com\nsearchText=first campaign",
      ),
      {
        searchText: "first campaign",
        testEmail: "demo@example.com",
      },
    );
  });
});
