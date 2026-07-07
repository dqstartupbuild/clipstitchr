import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DemoWalkthroughStep } from "../../src/demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentPageObservation } from "../../src/demoAgent/DemoAgentPageObservation.js";
import type { DemoAgentStepState } from "../../src/demoAgent/DemoAgentStepState.js";
import { createDemoAgentStepState } from "../../dist/demoAgent/createDemoAgentStepState.js";
import { planDemoAgentAction } from "../../dist/demoAgent/planDemoAgentAction.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";

const step: DemoWalkthroughStep = {
  id: "step-1",
  label: "Upload the sample clip",
};

function createObservation(
  overrides: Partial<DemoAgentPageObservation> = {},
): DemoAgentPageObservation {
  return {
    buttons: [],
    dialogs: [],
    headings: [],
    inputs: [],
    links: [],
    title: "Fixture app",
    url: "http://localhost:3000/dashboard",
    ...overrides,
  };
}

function planAction(
  observation: DemoAgentPageObservation,
  stepState: DemoAgentStepState,
) {
  return planDemoAgentAction({
    observation,
    policy: createDemoAgentTestPolicy(),
    step,
    stepState,
  });
}

describe("planDemoAgentAction", () => {
  it("captures a screenshot before acting on each step", () => {
    const action = planAction(createObservation(), createDemoAgentStepState());

    assert.equal(action.type, "screenshot");
    assert.equal(action.stepId, "step-1");
  });

  it("types an approved value when a visible input matches the guide step", () => {
    const stepState = createDemoAgentStepState();

    stepState.hasScreenshot = true;

    const action = planAction(
      createObservation({
        inputs: [
          {
            label: "Upload the sample clip",
            name: "Upload the sample clip",
            role: "input",
          },
        ],
      }),
      stepState,
    );

    assert.equal(action.type, "type");
    assert.equal(action.stepId, "step-1");

    if (action.type === "type") {
      assert.equal(action.target.label, "Upload the sample clip");
      assert.equal(action.valueKey, "testEmail");
    }
  });

  it("clicks a visible control when it matches the guide step", () => {
    const stepState = createDemoAgentStepState();

    stepState.hasScreenshot = true;

    const action = planAction(
      createObservation({
        buttons: [
          {
            name: "Upload the sample clip",
            role: "button",
          },
        ],
      }),
      stepState,
    );

    assert.equal(action.type, "click");
    assert.equal(action.stepId, "step-1");

    if (action.type === "click") {
      assert.equal(action.target.name, "Upload the sample clip");
      assert.equal(action.target.role, "button");
    }
  });

  it("waits for the guide step text when the page is still loading", () => {
    const stepState = createDemoAgentStepState();

    stepState.hasScreenshot = true;

    const action = planAction(
      createObservation({
        headings: [
          {
            name: "Loading report",
            role: "heading",
          },
        ],
      }),
      stepState,
    );

    assert.equal(action.type, "waitFor");
    assert.equal(action.stepId, "step-1");

    if (action.type === "waitFor") {
      assert.equal(action.visibleText, "Upload the sample clip");
    }
  });

  it("finishes the step when no safe visible action remains", () => {
    const stepState = createDemoAgentStepState();

    stepState.hasClicked = true;
    stepState.hasScreenshot = true;
    stepState.hasTyped = true;

    const action = planAction(
      createObservation({
        buttons: [
          {
            name: "Upload the sample clip",
            role: "button",
          },
        ],
        inputs: [
          {
            label: "Upload the sample clip",
            name: "Upload the sample clip",
            role: "input",
          },
        ],
      }),
      stepState,
    );

    assert.equal(action.type, "finishStep");
    assert.equal(action.stepId, "step-1");
  });
});
