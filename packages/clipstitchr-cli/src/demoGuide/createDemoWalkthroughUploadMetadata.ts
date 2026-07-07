import type { DemoWalkthroughAgentRunUploadMetadata } from "./DemoWalkthroughAgentRunUploadMetadata.js";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "./DemoWalkthroughTiming.js";
import type { DemoWalkthroughUploadMetadata } from "./DemoWalkthroughUploadMetadata.js";

export function createDemoWalkthroughUploadMetadata(input: {
  agentRun?: DemoWalkthroughAgentRunUploadMetadata;
  guide?: DemoWalkthroughGuide;
  timings?: DemoWalkthroughTiming[];
}): DemoWalkthroughUploadMetadata | undefined {
  if (!input.guide) {
    return undefined;
  }

  return {
    agentRun: input.agentRun,
    guide: input.guide,
    timings: input.timings?.length ? input.timings : undefined,
  };
}
