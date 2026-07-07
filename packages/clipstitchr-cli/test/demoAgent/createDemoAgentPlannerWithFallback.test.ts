import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DemoWalkthroughStep } from "../../src/demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentPageObservation } from "../../src/demoAgent/DemoAgentPageObservation.js";
import type { DemoAgentPlanner } from "../../src/demoAgent/DemoAgentPlanner.js";
import { createDemoAgentPlannerWithFallback } from "../../dist/demoAgent/createDemoAgentPlannerWithFallback.js";
import { createDemoAgentStepState } from "../../dist/demoAgent/createDemoAgentStepState.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";

const step: DemoWalkthroughStep = {
  id: "step-1",
  label: "Open Library",
};

const observation: DemoAgentPageObservation = {
  buttons: [],
  dialogs: [],
  headings: [],
  inputs: [],
  links: [
    {
      name: "Library",
      role: "link",
    },
  ],
  title: "Dashboard",
  url: "http://localhost:3000/dashboard",
};

describe("createDemoAgentPlannerWithFallback", () => {
  it("uses the local planner after the AI planner fails once", async () => {
    const fallbackErrors: unknown[] = [];
    const stepState = createDemoAgentStepState();
    let aiPlannerCalls = 0;
    const aiPlanner: DemoAgentPlanner = async () => {
      aiPlannerCalls += 1;
      throw new Error("Provider model was not found.");
    };
    const planner = createDemoAgentPlannerWithFallback({
      aiPlanner,
      onFallback: (error) => fallbackErrors.push(error),
    });

    stepState.hasScreenshot = true;

    const firstAction = await planner({
      observation,
      policy: createDemoAgentTestPolicy(),
      step,
      stepState,
    });

    assert.equal(firstAction.type, "click");
    assert.equal(aiPlannerCalls, 1);
    assert.equal(fallbackErrors.length, 1);

    stepState.hasClicked = true;

    const secondAction = await planner({
      observation,
      policy: createDemoAgentTestPolicy(),
      step,
      stepState,
    });

    assert.equal(secondAction.type, "finishStep");
    assert.equal(aiPlannerCalls, 1);
    assert.equal(fallbackErrors.length, 1);
  });
});
