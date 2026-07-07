import type { DemoAgentAction } from "./DemoAgentAction.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentValidatedAction } from "./DemoAgentValidatedAction.js";
import { assertDemoAgentTextAllowed } from "./assertDemoAgentTextAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { createDemoAgentUrlFromPath } from "./createDemoAgentUrlFromPath.js";
import { getDemoAgentActionTexts } from "./getDemoAgentActionTexts.js";
import { resolveDemoAgentApprovedUploadFile } from "./resolveDemoAgentApprovedUploadFile.js";

export function validateDemoAgentAction(input: {
  action: DemoAgentAction;
  currentUrl: string;
  currentStepId?: string;
  guideStepIds: string[];
  policy: DemoAgentPolicy;
}): DemoAgentValidatedAction {
  assertDemoAgentUrlAllowed(input.policy, input.currentUrl);

  for (const text of getDemoAgentActionTexts(input.action)) {
    if (text) {
      assertDemoAgentTextAllowed(input.policy, text);
    }
  }

  switch (input.action.type) {
    case "click":
      if (
        !input.action.target.label &&
        !input.action.target.text &&
        !input.action.target.name
      ) {
        throw new Error("Click actions need a user-visible target.");
      }

      return input.action;
    case "finishStep":
      if (!input.guideStepIds.includes(input.action.stepId)) {
        throw new Error("The agent tried to finish an unknown guide step.");
      }

      if (input.currentStepId && input.action.stepId !== input.currentStepId) {
        throw new Error("The agent tried to finish the wrong guide step.");
      }

      return input.action;
    case "navigate": {
      const resolvedUrl = createDemoAgentUrlFromPath(
        input.currentUrl,
        input.action.path,
      );

      assertDemoAgentUrlAllowed(input.policy, resolvedUrl);

      return {
        ...input.action,
        resolvedUrl,
      };
    }
    case "screenshot":
    case "stop":
      return input.action;
    case "type": {
      const resolvedValue =
        input.policy.approvedTestValues[input.action.valueKey];

      if (!resolvedValue) {
        throw new Error("The agent can only type approved test values.");
      }

      assertDemoAgentTextAllowed(input.policy, resolvedValue);

      return {
        ...input.action,
        resolvedValue,
      };
    }
    case "uploadFile":
      if (!input.policy.allowFileUploads) {
        throw new Error("File uploads are disabled for this agent policy.");
      }

      if (input.policy.requiresApprovalBeforeUpload) {
        throw new Error("File uploads need explicit policy approval first.");
      }

      return {
        ...input.action,
        resolvedFilePath: resolveDemoAgentApprovedUploadFile(
          input.policy,
          input.action.fileKey,
        ),
      };
    case "waitFor": {
      const timeoutMs = Math.min(
        10_000,
        Math.max(500, input.action.timeoutMs ?? 5000),
      );

      if (input.action.path) {
        const resolvedUrl = createDemoAgentUrlFromPath(
          input.currentUrl,
          input.action.path,
        );

        assertDemoAgentUrlAllowed(input.policy, resolvedUrl);

        return {
          ...input.action,
          resolvedUrl,
          timeoutMs,
        };
      }

      return {
        ...input.action,
        timeoutMs,
      };
    }
  }
}
