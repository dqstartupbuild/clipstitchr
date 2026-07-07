import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDemoAgentPlannerAction } from "../../dist/demoAgent/parseDemoAgentPlannerAction.js";

describe("parseDemoAgentPlannerAction", () => {
  it("parses a supported click action", () => {
    const action = parseDemoAgentPlannerAction(
      JSON.stringify({
        reason: "The guide says to upload the sample clip.",
        stepId: "step-2",
        target: {
          name: "Upload",
          role: "button",
        },
        type: "click",
      }),
    );

    assert.equal(action.type, "click");

    if (action.type === "click") {
      assert.equal(action.target.name, "Upload");
      assert.equal(action.target.role, "button");
    }
  });

  it("rejects selector-based click actions", () => {
    assert.throws(
      () =>
        parseDemoAgentPlannerAction(
          JSON.stringify({
            target: { selector: "#delete-account" },
            type: "click",
          }),
        ),
      /CSS selectors/,
    );
  });

  it("rejects unsupported action types", () => {
    assert.throws(
      () =>
        parseDemoAgentPlannerAction(
          JSON.stringify({
            script: "alert(1)",
            type: "evaluate",
          }),
        ),
      /not supported/,
    );
  });

  it("requires type values to reference approved test value keys", () => {
    const action = parseDemoAgentPlannerAction(
      JSON.stringify({
        target: { label: "Email" },
        type: "type",
        valueKey: "testEmail",
      }),
    );

    assert.equal(action.type, "type");

    if (action.type === "type") {
      assert.equal(action.target.label, "Email");
      assert.equal(action.valueKey, "testEmail");
    }
  });
});
