import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";

export type WebRecordingOptions = {
  longRecordingWarningSeconds?: number;
  outputPath?: string;
  startCommand?: string;
  url: string;
  walkthroughGuide?: DemoWalkthroughGuide;
};
