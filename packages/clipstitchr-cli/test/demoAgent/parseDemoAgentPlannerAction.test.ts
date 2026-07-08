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

  it("parses type values that reference approved test value keys", () => {
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

  it("parses direct safe type text", () => {
    const action = parseDemoAgentPlannerAction(
      JSON.stringify({
        target: { label: "Hooks to learn from" },
        type: "type",
        valueText: "This app made demo creation finally feel simple.",
      }),
    );

    assert.equal(action.type, "type");

    if (action.type === "type") {
      assert.equal(action.target.label, "Hooks to learn from");
      assert.equal(
        action.valueText,
        "This app made demo creation finally feel simple.",
      );
    }
  });

  it("parses input click roles used by browser accessibility trees", () => {
    const action = parseDemoAgentPlannerAction(
      JSON.stringify({
        target: { name: "Demo product", role: "combobox" },
        type: "click",
      }),
    );

    assert.equal(action.type, "click");

    if (action.type === "click") {
      assert.equal(action.target.name, "Demo product");
      assert.equal(action.target.role, "combobox");
    }
  });

  it("treats generic input role text as a label-based click", () => {
    const action = parseDemoAgentPlannerAction(
      JSON.stringify({
        target: { label: "Hooks to learn from", role: "input" },
        type: "click",
      }),
    );

    assert.equal(action.type, "click");

    if (action.type === "click") {
      assert.equal(action.target.label, "Hooks to learn from");
      assert.equal(action.target.role, undefined);
    }
  });

  it("rejects type actions without a value key or text", () => {
    assert.throws(
      () =>
        parseDemoAgentPlannerAction(
          JSON.stringify({
            target: { label: "Hooks to learn from" },
            type: "type",
          }),
        ),
      /value key or text/,
    );
  });
});
