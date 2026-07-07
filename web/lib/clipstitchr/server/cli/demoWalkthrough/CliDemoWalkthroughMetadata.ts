import type { CliDemoWalkthroughGuide } from "./CliDemoWalkthroughGuide";
import type { CliDemoWalkthroughTiming } from "./CliDemoWalkthroughTiming";

export type CliDemoWalkthroughMetadata = {
  guide: CliDemoWalkthroughGuide;
  timings?: CliDemoWalkthroughTiming[];
};
