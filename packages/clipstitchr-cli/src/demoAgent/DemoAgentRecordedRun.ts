import type { RecordingInteractionEvent } from "../recording/RecordingInteractionEvent.js";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";

export type DemoAgentRecordedRun = {
  interactionEvents?: RecordingInteractionEvent[];
  rawVideoPath: string;
  runSummaryPath: string;
  summary: DemoAgentRunSummary;
};
