import type { DemoAgentStepState } from "./DemoAgentStepState.js";

export function createDemoAgentStepState(): DemoAgentStepState {
  return {
    attemptedActionKeys: new Set<string>(),
    hasClicked: false,
    hasScreenshot: false,
    hasTyped: false,
    hasWaited: false,
  };
}
