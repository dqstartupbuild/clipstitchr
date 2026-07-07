import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentAction } from "./DemoAgentAction.js";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentStepState } from "./DemoAgentStepState.js";
import { findDemoAgentClickableTarget } from "./findDemoAgentClickableTarget.js";
import { findDemoAgentInputTarget } from "./findDemoAgentInputTarget.js";
import { getDemoAgentObservationHasLoadingState } from "./getDemoAgentObservationHasLoadingState.js";

export function planDemoAgentAction(input: {
  observation: DemoAgentPageObservation;
  policy: DemoAgentPolicy;
  step: DemoWalkthroughStep;
  stepState: DemoAgentStepState;
}): DemoAgentAction {
  if (!input.stepState.hasScreenshot) {
    return {
      reason: "Capture page evidence before acting on this guide step.",
      stepId: input.step.id,
      type: "screenshot",
    };
  }

  const inputTarget = findDemoAgentInputTarget(
    input.observation,
    input.step.label,
  );
  const firstValueKey = Object.keys(input.policy.approvedTestValues)[0];

  if (inputTarget?.label && firstValueKey && !input.stepState.hasTyped) {
    return {
      reason: `The visible input matches the guide step: ${input.step.label}`,
      stepId: input.step.id,
      target: { label: inputTarget.label },
      type: "type",
      valueKey: firstValueKey,
    };
  }

  const clickableTarget = findDemoAgentClickableTarget(
    input.observation,
    input.step.label,
  );

  if (clickableTarget && !input.stepState.hasClicked) {
    return {
      reason: `The visible control matches the guide step: ${input.step.label}`,
      stepId: input.step.id,
      target: clickableTarget,
      type: "click",
    };
  }

  if (
    getDemoAgentObservationHasLoadingState(input.observation) &&
    !input.stepState.hasWaited
  ) {
    return {
      reason: `The page is still loading before this guide step: ${input.step.label}`,
      stepId: input.step.id,
      timeoutMs: 5000,
      type: "waitFor",
      visibleText: input.step.label,
    };
  }

  return {
    reason: "No more safe visible actions were needed for this guide step.",
    stepId: input.step.id,
    type: "finishStep",
  };
}
