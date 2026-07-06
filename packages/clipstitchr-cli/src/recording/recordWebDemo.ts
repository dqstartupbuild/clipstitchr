import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { input } from "@inquirer/prompts";
import type { RecordingResult } from "./RecordingResult.js";
import type { WebRecordingOptions } from "./WebRecordingOptions.js";
import { convertVideoToMp4 } from "./convertVideoToMp4.js";
import { createBrowserProfileDirectory } from "./createBrowserProfileDirectory.js";
import { createRecordingOutputPath } from "./createRecordingOutputPath.js";
import { installBrowserInteractionCapture } from "./installBrowserInteractionCapture.js";
import { openRecordingBrowserContext } from "./openRecordingBrowserContext.js";
import { readBrowserInteractionEvents } from "./readBrowserInteractionEvents.js";
import { runShellCommand } from "./runShellCommand.js";
import { startLongRecordingWarningTimer } from "./startLongRecordingWarningTimer.js";
import { stopShellCommand } from "./stopShellCommand.js";
import { logInfo } from "../terminal/logInfo.js";
import { logStep } from "../terminal/logStep.js";
import { warnIfWebRecordingSizeUnexpected } from "./warnIfWebRecordingSizeUnexpected.js";
import { waitForHttpUrl } from "./waitForHttpUrl.js";

export async function recordWebDemo(
  options: WebRecordingOptions,
): Promise<RecordingResult> {
  const appProcess = options.startCommand
    ? runShellCommand(options.startCommand)
    : null;
  const videoDirectory = await mkdtemp(join(tmpdir(), "clipstitchr-video-"));
  const outputPath =
    options.outputPath ?? (await createRecordingOutputPath(process.cwd()));
  const userDataDir = await createBrowserProfileDirectory(process.cwd());

  try {
    logStep("Waiting for the local app to be ready.");
    await waitForHttpUrl(options.url);

    logInfo(
      "The recording browser is about to open. Walk through your demo there, then come back to this terminal and press Enter to finish.",
    );

    const context = await openRecordingBrowserContext({
      userDataDir,
      videoDirectory,
    });
    const page = await context.newPage();

    await installBrowserInteractionCapture(page);
    await page.goto(options.url, { waitUntil: "domcontentloaded" });
    const stopLongRecordingWarning = startLongRecordingWarningTimer(
      options.longRecordingWarningSeconds ?? 0,
    );

    try {
      await input({
        message: "Press Enter when you are done recording.",
      });
    } finally {
      stopLongRecordingWarning();
    }

    const interactionEvents = await readBrowserInteractionEvents(page);
    const video = page.video();

    await context.close();

    const rawVideoPath = await video?.path();

    if (!rawVideoPath) {
      throw new Error("No recording was saved.");
    }

    await convertVideoToMp4(rawVideoPath, outputPath);
    await warnIfWebRecordingSizeUnexpected(outputPath);

    return {
      interactionEvents,
      outputPath,
      rawVideoPath,
    };
  } finally {
    stopShellCommand(appProcess);
  }
}
