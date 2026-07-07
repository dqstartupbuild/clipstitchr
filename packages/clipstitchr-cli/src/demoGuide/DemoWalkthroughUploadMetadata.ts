import type { DemoWalkthroughAgentRunUploadMetadata } from "./DemoWalkthroughAgentRunUploadMetadata.js";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "./DemoWalkthroughTiming.js";

export type DemoWalkthroughUploadMetadata = {
  agentRun?: DemoWalkthroughAgentRunUploadMetadata;
  guide: DemoWalkthroughGuide;
  timings?: DemoWalkthroughTiming[];
};
