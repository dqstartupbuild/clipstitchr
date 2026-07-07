import {
  demoAgentGuideCompleteStopReason,
  legacyDemoAgentGuideCompleteStopReason,
} from "./demoAgentGuideCompleteStopReason.js";

export function getDemoAgentStopReasonIsGuideComplete(stopReason: string) {
  return (
    stopReason === demoAgentGuideCompleteStopReason ||
    stopReason === legacyDemoAgentGuideCompleteStopReason
  );
}
