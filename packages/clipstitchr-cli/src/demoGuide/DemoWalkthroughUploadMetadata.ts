import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "./DemoWalkthroughTiming.js";

export type DemoWalkthroughUploadMetadata = {
  guide: DemoWalkthroughGuide;
  timings?: DemoWalkthroughTiming[];
};
