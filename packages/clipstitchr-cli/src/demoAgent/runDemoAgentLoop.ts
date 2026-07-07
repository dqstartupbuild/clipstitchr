import type { Page } from "playwright";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";
import { assertDemoAgentObservationAllowed } from "./assertDemoAgentObservationAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { captureDemoAgentScreenshot } from "./captureDemoAgentScreenshot.js";
import { createDemoAgentActionKey } from "./createDemoAgentActionKey.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentStepState } from "./createDemoAgentStepState.js";
import { createDemoAgentTiming } from "./createDemoAgentTiming.js";
import type { DemoAgentLoopResult } from "./DemoAgentLoopResult.js";
import type { DemoAgentPlanner } from "./DemoAgentPlanner.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import type { DemoAgentValidatedAction } from "./DemoAgentValidatedAction.js";
import { executeDemoAgentAction } from "./executeDemoAgentAction.js";
import { getDemoAgentObservationHasNotFoundState } from "./getDemoAgentObservationHasNotFoundState.js";
import { getDemoAgentRecordingTimeLimitReached } from "./getDemoAgentRecordingTimeLimitReached.js";
import { getDemoAgentUrlPolicyStopReason } from "./getDemoAgentUrlPolicyStopReason.js";
import { observeDemoAgentPage } from "./observeDemoAgentPage.js";
import { planDemoAgentAction } from "./planDemoAgentAction.js";
import { validateDemoAgentAction } from "./validateDemoAgentAction.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeDemoAgentLoopStopEntry } from "./writeDemoAgentLoopStopEntry.js";

export async function runDemoAgentLoop(input: {
  guide: DemoWalkthroughGuide;
  initialActionCount?: number;
  initialScreenshotCount?: number;
  page: Page;
  policy: DemoAgentPolicy;
  planner?: DemoAgentPlanner;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath" | "screenshotsDirectory">;
  startedAtMs: number;
}): Promise<DemoAgentLoopResult> {
  const stepTimings: DemoWalkthroughTiming[] = [];
  const failureCounts = new Map<string, number>();
  const screenshotFingerprints = new Map<string, number>();
  const guideStepIds = input.guide.steps.map((guideStep) => guideStep.id);
  let actionCount = input.initialActionCount ?? 0;
  let screenshotCount = input.initialScreenshotCount ?? 0;
  let stopReason = "dry-run-complete";

  for (const [index, step] of input.guide.steps.entries()) {
    const stepStartedAtMs = Date.now() - input.startedAtMs;
    const stepState = createDemoAgentStepState();
    let actionCountForStep = 0;

    while (true) {
      if (
        getDemoAgentRecordingTimeLimitReached({
          nowMs: Date.now(),
          policy: input.policy,
          startedAtMs: input.startedAtMs,
        })
      ) {
        stopReason = "max-recording-seconds";
        await writeDemoAgentLoopStopEntry({
          page: input.page,
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
        });
        break;
      }

      if (actionCount >= input.policy.maxActions) {
        stopReason = "max-actions";
        await writeDemoAgentLoopStopEntry({
          page: input.page,
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
        });
        break;
      }

      if (actionCountForStep >= 10) {
        stopReason = "no-step-progress";
        await writeDemoAgentLoopStopEntry({
          page: input.page,
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
        });
        break;
      }

      try {
        assertDemoAgentUrlAllowed(input.policy, input.page.url());
      } catch (error) {
        const urlBefore = input.page.url();
        const urlAfter = input.page.url();

        actionCount += 1;
        actionCountForStep += 1;
        stopReason = getDemoAgentUrlPolicyStopReason(input.policy, urlAfter);

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "stop",
            details: {
              error:
                error instanceof Error
                  ? error.message
                  : "Policy blocked the current page URL.",
              policyDecision: "blocked",
              urlAfter,
              urlBefore,
            },
            result: "blocked",
            stepId: step.id,
            stopReason,
            url: urlAfter,
          }),
        );
        break;
      }

      const observation = await observeDemoAgentPage(input.page);

      try {
        assertDemoAgentObservationAllowed(input.policy, observation);
      } catch (error) {
        const urlBefore = input.page.url();
        const urlAfter = input.page.url();

        actionCount += 1;
        actionCountForStep += 1;
        stopReason = "blocked-page-state";

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "stop",
            details: {
              error:
                error instanceof Error
                  ? error.message
                  : "Policy blocked observed page text.",
              policyDecision: "blocked",
              urlAfter,
              urlBefore,
            },
            result: "blocked",
            stepId: step.id,
            stopReason,
            url: urlAfter,
          }),
        );
        break;
      }

      if (getDemoAgentObservationHasNotFoundState(observation)) {
        const urlBefore = input.page.url();
        const urlAfter = input.page.url();

        actionCount += 1;
        actionCountForStep += 1;
        stopReason = "not-found-page";

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "stop",
            details: {
              error: "The agent stopped on a not-found page.",
              policyDecision: "blocked",
              urlAfter,
              urlBefore,
            },
            result: "blocked",
            stepId: step.id,
            stopReason,
            url: urlAfter,
          }),
        );
        break;
      }

      const plannedAction = await (input.planner ?? planDemoAgentAction)({
        observation,
        policy: input.policy,
        step,
        stepState,
      });
      const actionKey = createDemoAgentActionKey(plannedAction);
      const urlBefore = input.page.url();
      let validatedAction: DemoAgentValidatedAction;

      actionCount += 1;
      actionCountForStep += 1;
      stepState.attemptedActionKeys.add(actionKey);

      try {
        validatedAction = validateDemoAgentAction({
          action: plannedAction,
          currentStepId: step.id,
          currentUrl: urlBefore,
          guideStepIds,
          policy: input.policy,
        });
      } catch (error) {
        const failureCount = (failureCounts.get(actionKey) ?? 0) + 1;
        const urlAfter = input.page.url();

        failureCounts.set(actionKey, failureCount);
        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: plannedAction.type,
            details: {
              action: JSON.stringify(plannedAction),
              error:
                error instanceof Error
                  ? error.message
                  : "Policy blocked action.",
              policyDecision: "blocked",
              urlAfter,
              urlBefore,
            },
            result: "blocked",
            stepId: plannedAction.stepId,
            url: urlAfter,
          }),
        );

        if (failureCount >= 2) {
          stopReason = "same-action-failed";
          break;
        }

        continue;
      }

      try {
        if (validatedAction.type === "screenshot") {
          const screenshot = await captureDemoAgentScreenshot({
            index: screenshotCount,
            page: input.page,
            screenshotsDirectory: input.runPaths.screenshotsDirectory,
            stepId: step.id,
          });
          const urlAfter = input.page.url();
          const screenshotKey = `${urlAfter}:${screenshot.fingerprint}`;
          const fingerprintCount =
            (screenshotFingerprints.get(screenshotKey) ?? 0) + 1;

          screenshotFingerprints.set(screenshotKey, fingerprintCount);
          screenshotCount += 1;
          stepState.hasScreenshot = true;

          await writeDemoAgentActionLogEntry(
            input.runPaths.actionLogPath,
            createDemoAgentActionLogEntry({
              action: "screenshot",
              details: {
                action: JSON.stringify(validatedAction),
                fileName: screenshot.fileName,
                fingerprint: screenshot.fingerprint.slice(0, 16),
                policyDecision: "approved",
                urlAfter,
                urlBefore,
              },
              result: "ok",
              stepId: step.id,
              url: urlAfter,
            }),
          );

          if (fingerprintCount >= input.policy.stuckStateLimit) {
            stopReason = "repeated-page-state";
            break;
          }

          continue;
        }

        await executeDemoAgentAction({
          action: validatedAction,
          page: input.page,
        });

        const urlAfter = input.page.url();

        try {
          assertDemoAgentUrlAllowed(input.policy, urlAfter);
        } catch (error) {
          stopReason = getDemoAgentUrlPolicyStopReason(input.policy, urlAfter);

          await writeDemoAgentActionLogEntry(
            input.runPaths.actionLogPath,
            createDemoAgentActionLogEntry({
              action: validatedAction.type,
              details: {
                action: JSON.stringify(validatedAction),
                error:
                  error instanceof Error
                    ? error.message
                    : "Policy blocked the resulting page URL.",
                policyDecision: "blocked",
                urlAfter,
                urlBefore,
              },
              result: "blocked",
              stepId: validatedAction.stepId,
              stopReason,
              url: urlAfter,
            }),
          );
          break;
        }

        if (validatedAction.type === "click") {
          stepState.hasClicked = true;
        }

        if (validatedAction.type === "type") {
          stepState.hasTyped = true;
        }

        if (validatedAction.type === "waitFor") {
          stepState.hasWaited = true;
        }

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: validatedAction.type,
            details: {
              action: JSON.stringify(validatedAction),
              policyDecision: "approved",
              urlAfter,
              urlBefore,
            },
            result: validatedAction.type === "stop" ? "stopped" : "ok",
            stepId: validatedAction.stepId,
            stopReason:
              validatedAction.type === "stop"
                ? validatedAction.reason
                : undefined,
            url: urlAfter,
          }),
        );

        if (validatedAction.type === "finishStep") {
          stepTimings.push(
            createDemoAgentTiming({
              completedAtMs: Date.now() - input.startedAtMs,
              startedAtMs: stepStartedAtMs,
              step,
              stepIndex: index,
            }),
          );
          break;
        }

        if (validatedAction.type === "stop") {
          stopReason = validatedAction.reason;
          break;
        }
      } catch (error) {
        const failureCount = (failureCounts.get(actionKey) ?? 0) + 1;
        const urlAfter = input.page.url();

        failureCounts.set(actionKey, failureCount);
        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: plannedAction.type,
            details: {
              action: JSON.stringify(plannedAction),
              error: error instanceof Error ? error.message : "Action failed.",
              policyDecision: "approved",
              urlAfter,
              urlBefore,
            },
            result: "failed",
            stepId: plannedAction.stepId,
            url: urlAfter,
          }),
        );

        if (failureCount >= 2) {
          stopReason = "same-action-failed";
          break;
        }
      }
    }

    if (stopReason !== "dry-run-complete") {
      break;
    }
  }

  return {
    actionCount,
    screenshotCount,
    stepTimings,
    stopReason,
  };
}
