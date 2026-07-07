import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";

export type DemoAgentLoopResult = {
  actionCount: number;
  screenshotCount: number;
  stepTimings: DemoWalkthroughTiming[];
  stopReason: string;
};
