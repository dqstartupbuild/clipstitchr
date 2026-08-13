import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";

export const STUDIO_CLIPS_RESUME_CHECKPOINTS = [
  "source_acquired",
  "media_validated",
  "transcribed",
  "analyzed",
  "b_roll_ready",
  "rendered",
  "output_stored",
] as const satisfies readonly StudioClipsCheckpoint[];

export type StudioClipsResumePointer = {
  checkpoint: (typeof STUDIO_CLIPS_RESUME_CHECKPOINTS)[number];
  revision: number;
};
