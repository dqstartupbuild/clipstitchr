import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import { logInfo } from "../terminal/logInfo.js";

export function logRecordingBrowserOpeningMessage(
  walkthroughGuide?: DemoWalkthroughGuide,
) {
  logInfo(
    walkthroughGuide
      ? "The recording browser is about to open. Walk through each checklist step there, then come back to this terminal and press Enter as each step is done."
      : "The recording browser is about to open. Walk through your demo there, then come back to this terminal and press Enter to finish.",
  );
}
