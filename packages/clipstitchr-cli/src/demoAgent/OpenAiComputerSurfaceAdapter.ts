import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";
import type { OpenAiComputerScreenshot } from "./OpenAiComputerScreenshot.js";
import type { OpenAiComputerSurfaceStateValidation } from "./OpenAiComputerSurfaceStateValidation.js";

export type OpenAiComputerSurfaceAdapter = {
  captureScreenshot(input: {
    index: number;
    screenshotsDirectory: string;
    stepId?: string;
  }): Promise<OpenAiComputerScreenshot>;
  executeAction(input: {
    action: OpenAiComputerAction;
    policy: DemoAgentPolicy;
  }): Promise<void>;
  getLocation(): string;
  validateState(
    policy: DemoAgentPolicy,
  ): Promise<OpenAiComputerSurfaceStateValidation>;
  waitForActionToSettle(): Promise<void>;
};
