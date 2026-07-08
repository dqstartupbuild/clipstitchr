import type { DemoAgentAction } from "./DemoAgentAction.js";

export function assertDemoAgentActionStepMatchesCurrentStep(input: {
  action: DemoAgentAction;
  currentStepId?: string;
  guideStepIds: string[];
}) {
  if (
    input.action.stepId &&
    input.guideStepIds.length > 0 &&
    !input.guideStepIds.includes(input.action.stepId)
  ) {
    throw new Error("The agent tried to act on an unknown guide step.");
  }

  if (
    input.currentStepId &&
    input.action.stepId &&
    input.action.stepId !== input.currentStepId
  ) {
    throw new Error("The agent tried to act on the wrong guide step.");
  }
}
