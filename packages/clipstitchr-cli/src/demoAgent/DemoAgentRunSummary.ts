import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";

export type DemoAgentRunSummary = {
  actionCount: number;
  allowedOrigins: string[];
  approvedForUpload: boolean;
  endedAt: string;
  guideId: string;
  guideSource: string;
  id: string;
  mode: "guided-browser";
  policyHash: string;
  recordingPath?: string;
  runDirectory: string;
  screenshotCount: number;
  startUrl: string;
  startedAt: string;
  stepTimings: DemoWalkthroughTiming[];
  stopReason: string;
  uploaded: boolean;
};
