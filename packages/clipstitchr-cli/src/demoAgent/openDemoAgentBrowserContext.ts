import { confirm } from "@inquirer/prompts";
import { chromium } from "playwright";
import { installPlaywrightChromium } from "../recording/installPlaywrightChromium.js";
import { isMissingPlaywrightBrowserError } from "../recording/isMissingPlaywrightBrowserError.js";
import { webRecordingViewport } from "../recording/webRecordingViewport.js";

async function launchDemoAgentBrowserContext(userDataDir: string) {
  return await chromium.launchPersistentContext(userDataDir, {
    args: [
      `--window-size=${webRecordingViewport.width},${webRecordingViewport.height}`,
      "--force-device-scale-factor=1",
    ],
    deviceScaleFactor: 1,
    headless: false,
    screen: webRecordingViewport,
    viewport: webRecordingViewport,
  });
}

export async function openDemoAgentBrowserContext(userDataDir: string) {
  try {
    return await launchDemoAgentBrowserContext(userDataDir);
  } catch (error) {
    if (!isMissingPlaywrightBrowserError(error)) {
      throw error;
    }

    const shouldInstall = await confirm({
      default: true,
      message: "ClipStitchr needs a browser for the local agent. Install it now?",
    });

    if (!shouldInstall) {
      throw new Error(
        "ClipStitchr needs a browser for the local agent. Run `npx playwright install chromium` and try again.",
      );
    }

    await installPlaywrightChromium();

    return await launchDemoAgentBrowserContext(userDataDir);
  }
}
