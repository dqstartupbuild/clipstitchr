import { confirm } from "@inquirer/prompts";
import { chromium } from "playwright";
import { installPlaywrightChromium } from "./installPlaywrightChromium.js";
import { isMissingPlaywrightBrowserError } from "./isMissingPlaywrightBrowserError.js";
import { webRecordingViewport } from "./webRecordingViewport.js";

type OpenRecordingBrowserContextOptions = {
  allowInstallPrompt?: boolean;
  userDataDir: string;
  videoDirectory: string;
};

async function launchRecordingBrowserContext(
  options: OpenRecordingBrowserContextOptions,
) {
  return await chromium.launchPersistentContext(options.userDataDir, {
    args: [
      `--window-size=${webRecordingViewport.width},${webRecordingViewport.height}`,
      "--force-device-scale-factor=1",
    ],
    deviceScaleFactor: 1,
    headless: false,
    recordVideo: {
      dir: options.videoDirectory,
      size: webRecordingViewport,
    },
    screen: webRecordingViewport,
    viewport: webRecordingViewport,
  });
}

export async function openRecordingBrowserContext(
  options: OpenRecordingBrowserContextOptions,
) {
  try {
    return await launchRecordingBrowserContext(options);
  } catch (error) {
    if (!isMissingPlaywrightBrowserError(error)) {
      throw error;
    }

    if (options.allowInstallPrompt === false) {
      throw new Error(
        "ClipStitchr needs a recording browser. Run `npx playwright install chromium` and try again.",
      );
    }

    const shouldInstall = await confirm({
      default: true,
      message: "ClipStitchr needs a browser for recording. Install it now?",
    });

    if (!shouldInstall) {
      throw new Error(
        "ClipStitchr needs a recording browser. Run `npx playwright install chromium` and try again.",
      );
    }

    await installPlaywrightChromium();

    return await launchRecordingBrowserContext(options);
  }
}
