export const STUDIO_CLIPS_COST_STAGES = [
  "download",
  "transcription",
  "llm",
  "b_roll",
  "render",
] as const;

export type StudioClipsCostStage =
  (typeof STUDIO_CLIPS_COST_STAGES)[number];
