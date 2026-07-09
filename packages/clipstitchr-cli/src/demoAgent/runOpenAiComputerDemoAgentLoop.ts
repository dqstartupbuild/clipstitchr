import type { Page } from "playwright";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { assertDemoAgentObservationAllowed } from "./assertDemoAgentObservationAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { captureOpenAiComputerScreenshot } from "./captureOpenAiComputerScreenshot.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentTiming } from "./createDemoAgentTiming.js";
import { createOpenAiComputerInitialInput } from "./createOpenAiComputerInitialInput.js";
import { createOpenAiComputerScreenshotOutput } from "./createOpenAiComputerScreenshotOutput.js";
import { demoAgentGuideCompleteStopReason } from "./demoAgentGuideCompleteStopReason.js";
import type { DemoAgentLoopResult } from "./DemoAgentLoopResult.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { executeOpenAiComputerAction } from "./executeOpenAiComputerAction.js";
import { findOpenAiComputerCall } from "./findOpenAiComputerCall.js";
import { getDemoAgentObservationHasNotFoundState } from "./getDemoAgentObservationHasNotFoundState.js";
import { getDemoAgentRecordingTimeLimitReached } from "./getDemoAgentRecordingTimeLimitReached.js";
import { getDemoAgentStepIsScrollTour } from "./getDemoAgentStepIsScrollTour.js";
import { getDemoAgentUrlPolicyStopReason } from "./getDemoAgentUrlPolicyStopReason.js";
import { getOpenAiComputerActionLogType } from "./getOpenAiComputerActionLogType.js";
import { getOpenAiComputerActionIsPageScroll } from "./getOpenAiComputerActionIsPageScroll.js";
import { maxDemoAgentScrollActionsPerStep } from "./maxDemoAgentScrollActionsPerStep.js";
import { observeDemoAgentPage } from "./observeDemoAgentPage.js";
import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";
import { requestOpenAiComputerResponse } from "./requestOpenAiComputerResponse.js";
import { waitForOpenAiComputerActionToSettle } from "./waitForOpenAiComputerActionToSettle.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeDemoAgentLoopStopEntry } from "./writeDemoAgentLoopStopEntry.js";

export async function runOpenAiComputerDemoAgentLoop(input: {
  apiKey: string;
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  initialActionCount?: number;
  initialScreenshotCount?: number;
  model: string;
  page: Page;
  policy: DemoAgentPolicy;
  requester?: OpenAiComputerRequester;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath" | "screenshotsDirectory">;
  startedAtMs: number;
}): Promise<DemoAgentLoopResult> {
  const requester = input.requester ?? requestOpenAiComputerResponse;
  const stepTimings: DemoWalkthroughTiming[] = [];
  let actionCount = input.initialActionCount ?? 0;
  let screenshotCount = input.initialScreenshotCount ?? 0;
  let stopReason = demoAgentGuideCompleteStopReason;

  for (const [index, step] of input.guide.steps.entries()) {
    const stepStartedAtMs = Date.now() - input.startedAtMs;
    let actionCountForStep = 0;
    let pageScrollCountForStep = 0;
    let shouldFinishStep = false;
    let response: OpenAiComputerResponse;

    try {
      response = await requester({
        apiKey: input.apiKey,
        input: createOpenAiComputerInitialInput({
          appContext: input.appContext,
          guide: input.guide,
          policy: input.policy,
          step,
          stepIndex: index,
        }),
        model: input.model,
      });
    } catch (error) {
      actionCount += 1;
      stopReason = "openai-computer-error";
      await writeDemoAgentActionLogEntry(
        input.runPaths.actionLogPath,
        createDemoAgentActionLogEntry({
          action: "stop",
          details: {
            driver: "openai-computer",
            error:
              error instanceof Error
                ? error.message
                : "OpenAI Computer Use request failed.",
            policyDecision: "approved",
            urlAfter: input.page.url(),
            urlBefore: input.page.url(),
          },
          result: "failed",
          stepId: step.id,
          stopReason,
          url: input.page.url(),
        }),
      );
      break;
    }

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
              driver: "openai-computer",
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
              driver: "openai-computer",
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
              driver: "openai-computer",
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

      const computerCall = findOpenAiComputerCall(response);

      if (!computerCall) {
        actionCount += 1;
        actionCountForStep += 1;

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "finishStep",
            details: {
              driver: "openai-computer",
              policyDecision: "approved",
              responseId: response.id,
              urlAfter: input.page.url(),
              urlBefore: input.page.url(),
            },
            result: "ok",
            stepId: step.id,
            url: input.page.url(),
          }),
        );

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

      for (const action of computerCall.actions) {
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

        const urlBefore = input.page.url();

        actionCount += 1;
        actionCountForStep += 1;

        try {
          await executeOpenAiComputerAction({
            action,
            page: input.page,
            policy: input.policy,
          });
          await waitForOpenAiComputerActionToSettle(input.page);

          const urlAfter = input.page.url();

          try {
            assertDemoAgentUrlAllowed(input.policy, urlAfter);
          } catch (error) {
            stopReason = getDemoAgentUrlPolicyStopReason(
              input.policy,
              urlAfter,
            );

            await writeDemoAgentActionLogEntry(
              input.runPaths.actionLogPath,
              createDemoAgentActionLogEntry({
                action: getOpenAiComputerActionLogType(action),
                details: {
                  action: JSON.stringify(action),
                  callId: computerCall.call_id,
                  driver: "openai-computer",
                  error:
                    error instanceof Error
                      ? error.message
                      : "Policy blocked the resulting page URL.",
                  policyDecision: "blocked",
                  responseId: response.id,
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

          await writeDemoAgentActionLogEntry(
            input.runPaths.actionLogPath,
            createDemoAgentActionLogEntry({
              action: getOpenAiComputerActionLogType(action),
              details: {
                action: JSON.stringify(action),
                callId: computerCall.call_id,
                driver: "openai-computer",
                policyDecision: "approved",
                responseId: response.id,
                urlAfter,
                urlBefore,
              },
              result: "ok",
              stepId: step.id,
              url: urlAfter,
            }),
          );

          if (
            getDemoAgentStepIsScrollTour(step) &&
            getOpenAiComputerActionIsPageScroll(action)
          ) {
            pageScrollCountForStep += 1;
            shouldFinishStep =
              pageScrollCountForStep >= maxDemoAgentScrollActionsPerStep;
          }
        } catch (error) {
          const urlAfter = input.page.url();

          stopReason = "openai-computer-action-failed";
          await writeDemoAgentActionLogEntry(
            input.runPaths.actionLogPath,
            createDemoAgentActionLogEntry({
              action: getOpenAiComputerActionLogType(action),
              details: {
                action: JSON.stringify(action),
                callId: computerCall.call_id,
                driver: "openai-computer",
                error:
                  error instanceof Error ? error.message : "Action failed.",
                policyDecision: "approved",
                responseId: response.id,
                urlAfter,
                urlBefore,
              },
              result: "failed",
              stepId: step.id,
              stopReason,
              url: urlAfter,
            }),
          );
          break;
        }

        if (shouldFinishStep) {
          break;
        }
      }

      if (stopReason !== demoAgentGuideCompleteStopReason) {
        break;
      }

      if (shouldFinishStep) {
        actionCount += 1;
        actionCountForStep += 1;

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "finishStep",
            details: {
              driver: "openai-computer",
              policyDecision: "approved",
              responseId: response.id,
              urlAfter: input.page.url(),
              urlBefore: input.page.url(),
            },
            result: "ok",
            stepId: step.id,
            url: input.page.url(),
          }),
        );

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

      const screenshot = await captureOpenAiComputerScreenshot({
        index: screenshotCount,
        page: input.page,
        screenshotsDirectory: input.runPaths.screenshotsDirectory,
        stepId: step.id,
      });
      const screenshotUrl = input.page.url();

      screenshotCount += 1;

      await writeDemoAgentActionLogEntry(
        input.runPaths.actionLogPath,
        createDemoAgentActionLogEntry({
          action: "screenshot",
          details: {
            callId: computerCall.call_id,
            driver: "openai-computer",
            fileName: screenshot.fileName,
            fingerprint: screenshot.fingerprint.slice(0, 16),
            policyDecision: "approved",
            responseId: response.id,
            urlAfter: screenshotUrl,
            urlBefore: screenshotUrl,
          },
          result: "ok",
          stepId: step.id,
          url: screenshotUrl,
        }),
      );

      try {
        response = await requester({
          apiKey: input.apiKey,
          input: createOpenAiComputerScreenshotOutput({
            base64: screenshot.base64,
            callId: computerCall.call_id,
          }),
          model: input.model,
          previousResponseId: response.id,
        });
      } catch (error) {
        actionCount += 1;
        stopReason = "openai-computer-error";
        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "stop",
            details: {
              callId: computerCall.call_id,
              driver: "openai-computer",
              error:
                error instanceof Error
                  ? error.message
                  : "OpenAI Computer Use request failed.",
              policyDecision: "approved",
              responseId: response.id,
              urlAfter: input.page.url(),
              urlBefore: input.page.url(),
            },
            result: "failed",
            stepId: step.id,
            stopReason,
            url: input.page.url(),
          }),
        );
        break;
      }
    }

    if (stopReason !== demoAgentGuideCompleteStopReason) {
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
