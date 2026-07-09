import type { Page } from "playwright";
import { assertDemoAgentObservationAllowed } from "./assertDemoAgentObservationAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { captureOpenAiComputerScreenshot } from "./captureOpenAiComputerScreenshot.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { executeOpenAiComputerAction } from "./executeOpenAiComputerAction.js";
import { getDemoAgentObservationHasNotFoundState } from "./getDemoAgentObservationHasNotFoundState.js";
import { getDemoAgentUrlPolicyStopReason } from "./getDemoAgentUrlPolicyStopReason.js";
import { observeDemoAgentPage } from "./observeDemoAgentPage.js";
import type { OpenAiComputerSurfaceAdapter } from "./OpenAiComputerSurfaceAdapter.js";
import { waitForOpenAiComputerActionToSettle } from "./waitForOpenAiComputerActionToSettle.js";

export function createPlaywrightOpenAiComputerSurfaceAdapter(
  page: Page,
): OpenAiComputerSurfaceAdapter {
  return {
    captureScreenshot: async (input) =>
      await captureOpenAiComputerScreenshot({
        index: input.index,
        page,
        screenshotsDirectory: input.screenshotsDirectory,
        stepId: input.stepId,
      }),
    executeAction: async (input) => {
      await executeOpenAiComputerAction({
        action: input.action,
        page,
        policy: input.policy,
      });
    },
    getLocation: () => page.url(),
    validateState: async (policy: DemoAgentPolicy) => {
      try {
        assertDemoAgentUrlAllowed(policy, page.url());
      } catch (error) {
        return {
          errorMessage:
            error instanceof Error
              ? error.message
              : "Policy blocked the current page URL.",
          ok: false,
          policyDecision: "blocked",
          stopReason: getDemoAgentUrlPolicyStopReason(policy, page.url()),
        };
      }

      const observation = await observeDemoAgentPage(page);

      try {
        assertDemoAgentObservationAllowed(policy, observation);
      } catch (error) {
        return {
          errorMessage:
            error instanceof Error
              ? error.message
              : "Policy blocked observed page text.",
          ok: false,
          policyDecision: "blocked",
          stopReason: "blocked-page-state",
        };
      }

      if (getDemoAgentObservationHasNotFoundState(observation)) {
        return {
          errorMessage: "The agent stopped on a not-found page.",
          ok: false,
          policyDecision: "blocked",
          stopReason: "not-found-page",
        };
      }

      return { ok: true };
    },
    waitForActionToSettle: async () => {
      await waitForOpenAiComputerActionToSettle(page);
    },
  };
}
