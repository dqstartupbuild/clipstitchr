export const STUDIO_CLIPS_CHECKPOINTS = [
  "claim_validated",
  "source_acquired",
  "media_validated",
  "transcribed",
  "analyzed",
  "b_roll_ready",
  "rendered",
  "output_stored",
  "completed",
] as const;

export type StudioClipsCheckpoint =
  (typeof STUDIO_CLIPS_CHECKPOINTS)[number];
