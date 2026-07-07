import { createDemoWalkthroughUploadMetadata } from "../demoGuide/createDemoWalkthroughUploadMetadata.js";
import { createDemoAgentManualUploadCommand } from "./createDemoAgentManualUploadCommand.js";
import type { DemoAgentRecordingUploadReviewInput } from "./DemoAgentRecordingUploadReviewInput.js";
import type { DemoAgentRecordingUploadReviewResult } from "./DemoAgentRecordingUploadReviewResult.js";
import type { DemoAgentRecordingUploadReviewServices } from "./DemoAgentRecordingUploadReviewServices.js";

export async function reviewDemoAgentRecordingUpload(
  input: DemoAgentRecordingUploadReviewInput,
  services: DemoAgentRecordingUploadReviewServices,
): Promise<DemoAgentRecordingUploadReviewResult> {
  const recordingPath = input.recording.summary.recordingPath;

  if (!recordingPath) {
    throw new Error("The agent recording did not produce an MP4 path.");
  }

  const manualUploadCommand = createDemoAgentManualUploadCommand(recordingPath);

  if (input.recording.summary.stopReason !== "dry-run-complete") {
    services.logWarning(
      "The agent stopped before completing the guide. Review the run before uploading.",
    );
    services.logNextCommand(manualUploadCommand);
    return {
      approvedForUpload: false,
      skippedReason: "incomplete-run",
      uploaded: false,
    };
  }

  if (input.upload === false) {
    services.logInfo("Recording saved locally. No upload was started.");
    services.logNextCommand(manualUploadCommand);
    return {
      approvedForUpload: false,
      skippedReason: "upload-disabled",
      uploaded: false,
    };
  }

  const approvedForUpload = await services.confirmUpload();
  const reviewedSummary = {
    ...input.recording.summary,
    approvedForUpload,
  };

  await services.writeRunSummary(
    input.recording.runSummaryPath,
    reviewedSummary,
  );

  if (!approvedForUpload) {
    services.logInfo("Recording saved locally. Upload skipped.");
    services.logNextCommand(manualUploadCommand);
    return {
      approvedForUpload: false,
      skippedReason: "approval-declined",
      uploaded: false,
    };
  }

  const credentials =
    input.existingCredentials ??
    (await services.ensureCredentialsOrLogin(input.apiBaseUrl));
  const product = await services.selectProduct(
    credentials,
    input.preferredProductId,
  );

  services.logStep("Uploading the reviewed agent recording to ClipStitchr.");
  await services.uploadDemoFile(credentials, {
    filePath: recordingPath,
    interactionEvents: input.recording.interactionEvents,
    layout: input.recording.interactionEvents?.length
      ? "smart-screen-demo"
      : "fit-with-background",
    productId: product.id,
    wait: true,
    walkthrough: createDemoWalkthroughUploadMetadata({
      agentRun: {
        actionCount: input.recording.summary.actionCount,
        approvedForUpload: true,
        id: input.recording.summary.id,
        mode: "guided-browser",
        screenshotCount: input.recording.summary.screenshotCount,
        stopReason: input.recording.summary.stopReason,
        uploaded: true,
      },
      guide: input.guide,
      timings: input.recording.summary.stepTimings,
    }),
  });

  await services.writeRunSummary(input.recording.runSummaryPath, {
    ...reviewedSummary,
    uploaded: true,
  });
  services.logSuccess("Uploaded to your Demo library.");

  return {
    approvedForUpload: true,
    uploaded: true,
  };
}
