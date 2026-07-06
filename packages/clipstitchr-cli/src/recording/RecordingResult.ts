import type { RecordingInteractionEvent } from "./RecordingInteractionEvent.js";

export type RecordingResult = {
  interactionEvents?: RecordingInteractionEvent[];
  outputPath: string;
  rawVideoPath: string;
};
