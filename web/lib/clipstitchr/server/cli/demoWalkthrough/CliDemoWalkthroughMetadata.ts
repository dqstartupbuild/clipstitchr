import type { CliDemoWalkthroughAgentRunMetadata } from "./CliDemoWalkthroughAgentRunMetadata";
import type { CliDemoWalkthroughGuide } from "./CliDemoWalkthroughGuide";
import type { CliDemoWalkthroughTiming } from "./CliDemoWalkthroughTiming";

export type CliDemoWalkthroughMetadata = {
  agentRun?: CliDemoWalkthroughAgentRunMetadata;
  guide: CliDemoWalkthroughGuide;
  timings?: CliDemoWalkthroughTiming[];
};
