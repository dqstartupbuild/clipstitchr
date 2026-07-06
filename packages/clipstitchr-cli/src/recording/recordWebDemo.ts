import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { input } from "@inquirer/prompts";
import { chromium } from "playwright";
import type { RecordingResult } from "./RecordingResult.js";
import type { WebRecordingOptions } from "./WebRecordingOptions.js";
import { convertVideoToVerticalMp4 } from "./convertVideoToVerticalMp4.js";
import { createBrowserProfileDirectory } from "./createBrowserProfileDirectory.js";
import { createRecordingOutputPath } from "./createRecordingOutputPath.js";
import { runShellCommand } from "./runShellCommand.js";
import { stopShellCommand } from "./stopShellCommand.js";
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
    await waitForHttpUrl(options.url);

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      recordVideo: {
        dir: videoDirectory,
        size: {
          height: 844,
          width: 390,
        },
      },
      viewport: {
        height: 844,
        width: 390,
      },
    });
    const page = await context.newPage();

    await page.goto(options.url, { waitUntil: "domcontentloaded" });
    await input({
      message:
        "Walk through the demo in the browser, then press Enter here to finish.",
    });

    const video = page.video();

    await context.close();

    const rawVideoPath = await video?.path();

    if (!rawVideoPath) {
      throw new Error("No recording was saved.");
    }

    await convertVideoToVerticalMp4(rawVideoPath, outputPath);

    return {
      outputPath,
      rawVideoPath,
    };
  } finally {
    stopShellCommand(appProcess);
  }
}
