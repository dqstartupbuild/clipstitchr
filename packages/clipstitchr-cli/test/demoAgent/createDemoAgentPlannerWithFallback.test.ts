import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DemoWalkthroughStep } from "../../src/demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentPageObservation } from "../../src/demoAgent/DemoAgentPageObservation.js";
import type { DemoAgentPlanner } from "../../src/demoAgent/DemoAgentPlanner.js";
import { createDemoAgentPlannerWithFallback } from "../../dist/demoAgent/createDemoAgentPlannerWithFallback.js";
import { createDemoAgentStepState } from "../../dist/demoAgent/createDemoAgentStepState.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";
import { createDemoAgentTestGuide } from "./createDemoAgentTestGuide.js";

const step: DemoWalkthroughStep = {
  id: "step-1",
  label: "Open Library",
};

const observation: DemoAgentPageObservation = {
  buttons: [],
  canScrollDown: false,
  canScrollUp: false,
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
      guide: createDemoAgentTestGuide([step]),
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
      guide: createDemoAgentTestGuide([step]),
      observation,
      policy: createDemoAgentTestPolicy(),
      step,
      stepState,
    });

    assert.equal(secondAction.type, "finishStep");
    assert.equal(aiPlannerCalls, 1);
    assert.equal(fallbackErrors.length, 1);
  });

  it("uses the local planner for a repeated AI action without disabling AI", async () => {
    const fallbackErrors: unknown[] = [];
    const stepState = createDemoAgentStepState();
    let aiPlannerCalls = 0;
    const aiPlanner: DemoAgentPlanner = async () => {
      aiPlannerCalls += 1;

      return {
        reason: "Try the same sidebar link again.",
        stepId: "step-1",
        target: {
          name: "Library",
          role: "link",
        },
        type: "click",
      };
    };
    const planner = createDemoAgentPlannerWithFallback({
      aiPlanner,
      onFallback: (error) => fallbackErrors.push(error),
    });

    stepState.attemptedActionKeys.add("click:link:Library");
    stepState.hasClicked = true;
    stepState.hasScreenshot = true;

    const firstAction = await planner({
      guide: createDemoAgentTestGuide([step]),
      observation,
      policy: createDemoAgentTestPolicy(),
      step,
      stepState,
    });

    assert.equal(firstAction.type, "finishStep");
    assert.equal(aiPlannerCalls, 1);
    assert.equal(fallbackErrors.length, 1);

    const secondAction = await planner({
      guide: createDemoAgentTestGuide([step]),
      observation,
      policy: createDemoAgentTestPolicy(),
      step,
      stepState,
    });

    assert.equal(secondAction.type, "finishStep");
    assert.equal(aiPlannerCalls, 2);
    assert.equal(fallbackErrors.length, 2);
  });
});
