import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { DemoAgentRecordedRun } from "../demoAgent/DemoAgentRecordedRun.js";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";

export type DemoAgentRecordingUploadReviewInput = {
  apiBaseUrl: string;
  existingCredentials?: ClipstitchrCredentials;
  guide: DemoWalkthroughGuide;
  preferredProductId?: string;
  recording: DemoAgentRecordedRun;
  upload?: boolean;
};
