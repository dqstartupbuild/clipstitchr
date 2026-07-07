import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";
import type { RecordingInteractionEvent } from "./RecordingInteractionEvent.js";

export type RecordingResult = {
  interactionEvents?: RecordingInteractionEvent[];
  outputPath: string;
  rawVideoPath: string;
  walkthroughTimings?: DemoWalkthroughTiming[];
};
