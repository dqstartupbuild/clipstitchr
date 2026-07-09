import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentTiming } from "./createDemoAgentTiming.js";
import { createOpenAiComputerInitialInput } from "./createOpenAiComputerInitialInput.js";
import { createOpenAiComputerScreenshotOutput } from "./createOpenAiComputerScreenshotOutput.js";
import { demoAgentGuideCompleteStopReason } from "./demoAgentGuideCompleteStopReason.js";
import type { DemoAgentLoopResult } from "./DemoAgentLoopResult.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { findOpenAiComputerCall } from "./findOpenAiComputerCall.js";
import { getDemoAgentRecordingTimeLimitReached } from "./getDemoAgentRecordingTimeLimitReached.js";
import { getDemoAgentStepIsScrollTour } from "./getDemoAgentStepIsScrollTour.js";
import { getOpenAiComputerActionIsPageScroll } from "./getOpenAiComputerActionIsPageScroll.js";
import { getOpenAiComputerActionLogType } from "./getOpenAiComputerActionLogType.js";
import { maxDemoAgentScrollActionsPerStep } from "./maxDemoAgentScrollActionsPerStep.js";
import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";
import type { OpenAiComputerSurfaceAdapter } from "./OpenAiComputerSurfaceAdapter.js";
import { requestOpenAiComputerResponse } from "./requestOpenAiComputerResponse.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeOpenAiComputerSurfaceLoopStopEntry } from "./writeOpenAiComputerSurfaceLoopStopEntry.js";

export async function runOpenAiComputerSurfaceDemoAgentLoop(input: {
  apiKey?: string;
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  initialActionCount?: number;
  initialScreenshotCount?: number;
  model: string;
  policy: DemoAgentPolicy;
  requester?: OpenAiComputerRequester;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath" | "screenshotsDirectory">;
  startedAtMs: number;
  surface: OpenAiComputerSurfaceAdapter;
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
      const location = input.surface.getLocation();

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
            urlAfter: location,
            urlBefore: location,
          },
          result: "failed",
          stepId: step.id,
          stopReason,
          url: location,
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
        await writeOpenAiComputerSurfaceLoopStopEntry({
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
          surface: input.surface,
        });
        break;
      }

      if (actionCount >= input.policy.maxActions) {
        stopReason = "max-actions";
        await writeOpenAiComputerSurfaceLoopStopEntry({
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
          surface: input.surface,
        });
        break;
      }

      if (actionCountForStep >= 10) {
        stopReason = "no-step-progress";
        await writeOpenAiComputerSurfaceLoopStopEntry({
          runPaths: input.runPaths,
          stepId: step.id,
          stopReason,
          surface: input.surface,
        });
        break;
      }

      const state = await input.surface.validateState(input.policy);

      if (!state.ok) {
        const location = input.surface.getLocation();

        actionCount += 1;
        actionCountForStep += 1;
        stopReason = state.stopReason;

        await writeDemoAgentActionLogEntry(
          input.runPaths.actionLogPath,
          createDemoAgentActionLogEntry({
            action: "stop",
            details: {
              driver: "openai-computer",
              error: state.errorMessage,
              policyDecision: state.policyDecision,
              urlAfter: location,
              urlBefore: location,
            },
            result: "blocked",
            stepId: step.id,
            stopReason,
            url: location,
          }),
        );
        break;
      }

      const computerCall = findOpenAiComputerCall(response);

      if (!computerCall) {
        const location = input.surface.getLocation();

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
              urlAfter: location,
              urlBefore: location,
            },
            result: "ok",
            stepId: step.id,
            url: location,
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
          await writeOpenAiComputerSurfaceLoopStopEntry({
            runPaths: input.runPaths,
            stepId: step.id,
            stopReason,
            surface: input.surface,
          });
          break;
        }

        const urlBefore = input.surface.getLocation();

        actionCount += 1;
        actionCountForStep += 1;

        try {
          await input.surface.executeAction({
            action,
            policy: input.policy,
          });
          await input.surface.waitForActionToSettle();

          const stateAfterAction = await input.surface.validateState(
            input.policy,
          );
          const urlAfter = input.surface.getLocation();

          if (!stateAfterAction.ok) {
            stopReason = stateAfterAction.stopReason;

            await writeDemoAgentActionLogEntry(
              input.runPaths.actionLogPath,
              createDemoAgentActionLogEntry({
                action: getOpenAiComputerActionLogType(action),
                details: {
                  action: JSON.stringify(action),
                  callId: computerCall.call_id,
                  driver: "openai-computer",
                  error: stateAfterAction.errorMessage,
                  policyDecision: stateAfterAction.policyDecision,
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
          const urlAfter = input.surface.getLocation();

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
        const location = input.surface.getLocation();

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
              urlAfter: location,
              urlBefore: location,
            },
            result: "ok",
            stepId: step.id,
            url: location,
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

      const screenshot = await input.surface.captureScreenshot({
        index: screenshotCount,
        screenshotsDirectory: input.runPaths.screenshotsDirectory,
        stepId: step.id,
      });
      const screenshotUrl = input.surface.getLocation();

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
        const location = input.surface.getLocation();

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
              urlAfter: location,
              urlBefore: location,
            },
            result: "failed",
            stepId: step.id,
            stopReason,
            url: location,
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
